import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Club } from '@/models/Club';
import { AccessRequest } from '@/models/AccessRequest';
import { Settings } from '@/models/Settings';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { username, email, password, phone, isClubLeader, clubName, clubDescription } = await req.json();

    // Validate required fields
    if (!username || !email || !password) {
      return Response.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check maintenance mode
    const settings = await Settings.findOne();
    if (settings?.maintenanceMode) {
      return Response.json(
        { error: "Application is in maintenance mode. New registrations are temporarily disabled." },
        { status: 503 }
      );
    }

    // Check if new registrations are allowed
    if (!settings?.allowNewRegistrations) {
      return Response.json(
        { error: "New registrations are currently disabled by the administrator." },
        { status: 403 }
      );
    }

    // Check if user already exists by email only
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return Response.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if phone number already exists and validate format
    if (phone && typeof phone === 'string' && phone.trim()) {
      const phoneDigitsOnly = phone.replace(/\D/g, '');
      
      // Validate phone has 10 digits and first digit >= 6 (Indian format)
      if (phoneDigitsOnly.length !== 10) {
        return Response.json(
          { error: 'Phone number must be exactly 10 digits' },
          { status: 400 }
        );
      }
      if (parseInt(phoneDigitsOnly[0]) < 6) {
        return Response.json(
          { error: 'Phone number must start with a digit >= 6 (valid Indian format)' },
          { status: 400 }
        );
      }
      
      const existingPhone = await User.findOne({ phone: phoneDigitsOnly });
      if (existingPhone) {
        return Response.json(
          { error: 'Phone number already registered' },
          { status: 400 }
        );
      }
    }

    // Only allow club leaders to register directly
    if (!isClubLeader) {
      return Response.json(
        { error: 'Only club leaders can register. Please contact an admin for access.' },
        { status: 403 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Ensure phone is a string with only digits, not undefined
    const phoneNumber = phone && typeof phone === 'string' ? phone.replace(/\D/g, '') : '';

    // Create user (club leaders require admin approval)
    const user = new User({
      username,
      email,
      phone: phoneNumber,
      password: hashedPassword,
      isClubLeader: true,
      isApproved: false,  // Requires admin approval
    });

    await user.save();
    console.log('User saved with phone:', user.phone);

    // Check if club with same name already exists (case-insensitive, ignoring spaces)
    const normalizedClubName = clubName?.replace(/\s+/g, '').toLowerCase() || '';
    let club;
    
    if (normalizedClubName) {
      // Find all clubs and check by normalized name
      const allClubs = await Club.find();
      const existingClub = allClubs.find(c => 
        c.name.replace(/\s+/g, '').toLowerCase() === normalizedClubName
      );

      if (existingClub) {
        // Use existing club
        club = existingClub;
        if (!club.members.includes(user._id)) {
          club.members.push(user._id);
          await club.save();
        }
      } else {
        // Create new club
        club = new Club({
          name: clubName,
          description: clubDescription || `Club created by ${username}`,
          leader: user._id,
          members: [user._id],
        });
        await club.save();
      }
    } else {
      // Create club with default name
      club = new Club({
        name: `${username}'s Club`,
        description: clubDescription || `Club created by ${username}`,
        leader: user._id,
        members: [user._id],
      });
      await club.save();
    }

    // Assign club to user
    user.club = club._id;
    await user.save();

    // Create access request for admin to review
    const accessRequest = new AccessRequest({
      user: user._id,
      username: user.username,
      email: user.email,
      phone: phoneNumber,
      requestMessage: `Club leader registration request for ${clubName || `${username}'s Club`}`,
      status: 'pending',
    });
    await accessRequest.save();
    console.log('AccessRequest saved with phone:', accessRequest.phone);

    // Create JWT token (but user won't have access until approved)
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return Response.json(
      { 
        message: 'Registration successful! Please wait for admin approval.', 
        token, 
        userId: user._id,
        username: user.username,
        isClubLeader: true,
        isApproved: false
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error message:', errorMessage);
    console.error('Error stack:', errorStack);
    return Response.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'production' ? undefined : errorStack
      },
      { status: 500 }
    );
  }
}
