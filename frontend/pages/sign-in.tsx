// pages/sign-in.tsx
import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Container,
  Title,
  Paper,
  Text,
  Anchor,
  Alert,
  Stack,
  Group,
  Checkbox,
  Divider,
  Box
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../utils/api';

interface SignInFormValues {
  username: string;
  password: string;
  rememberMe: boolean;
}

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignInFormValues>({
    initialValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      username: (value) => (!value ? 'Username is required' : null),
      password: (value) => (!value ? 'Password is required' : null),
    },
  });

  const handleSubmit = async (values: SignInFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/token', new URLSearchParams({
        username: values.username,
        password: values.password,
      }));
      
      // Store token based on remember me preference
      if (values.rememberMe) {
        localStorage.setItem('token', response.data.access_token);
      } else {
        sessionStorage.setItem('token', response.data.access_token);
      }
      
      notifications.show({
        title: 'Welcome back!',
        message: 'Successfully signed in.',
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });
      
      // Redirect to tasks page
      router.push('/tasks');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(errorMessage);
      
      notifications.show({
        title: 'Sign In Failed',
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
            Welcome
          </Title>

          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md" variant="filled">
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
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Divider label="Or" labelPosition="center" my="lg" />

          <Group justify="center">
            <Text c="dimmed" size="sm">
              Don't have an account?{' '}
              <Link href="/sign-up" style={{ textDecoration: 'none' }}>
                <Text component="span" size="sm" fw={500} c="blue" style={{ cursor: 'pointer' }}>
                  Create account
                </Text>
              </Link>
            </Text>
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}