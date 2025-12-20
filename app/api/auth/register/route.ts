import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Club } from '@/models/Club';
import { AccessRequest } from '@/models/AccessRequest';
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

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return Response.json(
        { error: 'User already exists' },
        { status: 400 }
      );
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

    // Ensure phone is a string, not undefined
    const phoneNumber = phone && typeof phone === 'string' ? phone.trim() : '';

    // Create user (club leaders are NOT auto-approved, must wait for admin verification)
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

    // Create club for club leader
    let club = new Club({
      name: clubName || `${username}'s Club`,
      description: clubDescription || `Club created by ${username}`,
      leader: user._id,
    });
    await club.save();

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
