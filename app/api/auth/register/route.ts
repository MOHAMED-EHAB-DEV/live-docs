import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import User from '@/lib/models/user';
import bcrypt from 'bcryptjs';
import * as v from 'valibot';
import { SignUpSchema } from '@/lib/validations';
import * as valibot from 'valibot';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = valibot.safeParse(SignUpSchema, body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data', details: result.issues }, { status: 400 });
    }

    await connectToDatabase();

    const { name, email, password } = result.output;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: 'credentials',
      verified: true, // Auto-verify for now
    });

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ message: 'User registered successfully', user: { id: newUser._id, name, email } }, { status: 201 });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
