// pages/sign-up.tsx
import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Container,
  Title,
  Paper,
  Text,
  Alert,
  Stack,
  Group,
  Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';

interface SignUpFormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignUpFormValues>({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value) => {
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters long';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters long';
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return 'Please confirm your password';
        if (value !== values.password) return 'Passwords do not match';
        return null;
      },
    },
  });

  const handleSubmit = async (values: SignUpFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await api.post('/register', {
        username: values.username,
        password: values.password,
      });
      
      notifications.show({
        title: 'Success!',
        message: 'Account created successfully. Please sign in.',
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });
      
      router.push('/sign-in');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      
      notifications.show({
        title: 'Registration Failed',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Container size={420}>
        <Paper shadow="xl" p={40} radius="lg" withBorder>
          <Title order={2} ta="center" mb={30} c="dark">
            Create Account
          </Title>

          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Username"
                placeholder="Enter your username"
                {...form.getInputProps('username')}
                required
                disabled={loading}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                {...form.getInputProps('password')}
                required
                disabled={loading}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                {...form.getInputProps('confirmPassword')}
                required
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                mt="xl"
                loading={loading}
                disabled={loading}
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  border: 'none',
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Stack>
          </form>

          <Group justify="center" mt="xl">
            <Text c="dimmed" size="sm">
              Already have an account?{' '}
              <Link href="/sign-in" style={{ textDecoration: 'none' }}>
                <Text component="span" size="sm" fw={500} c="blue" style={{ cursor: 'pointer' }}>
                  Sign in
                </Text>
              </Link>
            </Text>
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}