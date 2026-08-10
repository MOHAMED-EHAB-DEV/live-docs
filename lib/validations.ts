import * as v from 'valibot';

export const SignInSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty('Email is required'),
    v.email('Invalid email address')
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty('Password is required'),
    v.minLength(6, 'Password must be at least 6 characters')
  )
});

export const SignUpSchema = v.object({
  name: v.pipe(
    v.string(),
    v.nonEmpty('Name is required'),
    v.minLength(2, 'Name must be at least 2 characters')
  ),
  email: v.pipe(
    v.string(),
    v.nonEmpty('Email is required'),
    v.email('Invalid email address')
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty('Password is required'),
    v.minLength(6, 'Password must be at least 6 characters')
  )
});

export const DocumentSchema = v.object({
  title: v.pipe(
    v.string(),
    v.nonEmpty('Title is required')
  )
});

export const CommentSchema = v.object({
  content: v.pipe(
    v.string(),
    v.nonEmpty('Content is required')
  )
});
