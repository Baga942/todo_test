// pages/tasks.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  TextInput,
  Button,
  Modal,
  Container,
  Title,
  Paper,
  Text,
  Stack,
  Group,
  Box,
  Card,
  ActionIcon,
  Grid,
  Badge,
  Textarea,
  Pagination,
  Select,
  Center,
  Skeleton
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconLogout, IconCheck, IconAlertCircle, IconSearch, IconX } from '@tabler/icons-react';
import api from '../utils/api';
import { useRouter } from 'next/router';

interface Task {
  id: number;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}

interface PaginationResponse {
  tasks: Task[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
];

const PRIORITY_COLORS = {
  low: 'green',
  medium: 'yellow',
  high: 'red',
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function Tasks() {
  const [allTasks, setAllTasks] = useState<Task[]>([]); // Store all tasks
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('medium');
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states (for filtered results)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('6');
  
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<string>('medium');

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      router.push('/sign-in');
    } else {
      fetchAllTasks();
    }
  }, []);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  const fetchAllTasks = async () => {
    setTasksLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Fetch all tasks at once
      const response = await api.get('/tasks/', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Handle both paginated and non-paginated responses
      const tasks = response.data.tasks || response.data;
      setAllTasks(tasks);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch tasks',
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
    } finally {
      setTasksLoading(false);
    }
  };

  // Filter tasks in frontend
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      return allTasks;
    }

    const query = searchQuery.toLowerCase().trim();
    return allTasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
    );
  }, [allTasks, searchQuery]);

  // Paginate filtered results
  const paginatedTasks = useMemo(() => {
    const size = parseInt(pageSize);
    const startIndex = (currentPage - 1) * size;
    const endIndex = startIndex + size;
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredTasks.length / parseInt(pageSize));
  const totalTasks = filteredTasks.length;

  const createTask = async () => {
    if (!title.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please enter a task title',
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await api.post(
        '/tasks/',
        { 
          title: title.trim(), 
          description: description.trim(),
          priority: priority
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Add new task to allTasks
      const newTask = response.data;
      setAllTasks(prev => [...prev, newTask]);
      
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCurrentPage(1);
      
      notifications.show({
        title: 'Success!',
        message: 'Task created successfully',
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create task',
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await api.delete(`/tasks/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Remove task from allTasks
      setAllTasks(prev => prev.filter(task => task.id !== id));
      
      // Check if we need to go to previous page after deletion
      const remainingTasks = paginatedTasks.length - 1;
      if (remainingTasks === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      notifications.show({
        title: 'Success!',
        message: 'Task deleted successfully',
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete task',
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
    }
  };

  const openEditModal = (task: Task) => {
    setEditTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority || 'medium');
    open();
  };

  const updateTask = async () => {
    if (editTaskId === null || !editTitle.trim()) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await api.put(
        `/tasks/${editTaskId}`,
        { 
          title: editTitle.trim(), 
          description: editDescription.trim(),
          priority: editPriority
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update task in allTasks
      setAllTasks(prev => prev.map(task =>
        task.id === editTaskId 
          ? { 
              ...task, 
              title: editTitle.trim(), 
              description: editDescription.trim(),
              priority: editPriority as 'low' | 'medium' | 'high'
            } 
          : task
      ));
      
      close();
      
      notifications.show({
        title: 'Success!',
        message: 'Task updated successfully',
        color: 'green',
        icon: <IconCheck size="1rem" />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update task',
        color: 'red',
        icon: <IconAlertCircle size="1rem" />,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    notifications.show({
      title: 'Goodbye!',
      message: 'You have been logged out successfully',
      color: 'blue',
      icon: <IconLogout size="1rem" />,
    });
    router.push('/sign-in');
  };

  const hasActiveSearch = searchQuery.trim();

  const renderTaskSkeleton = () => {
    return Array.from({ length: parseInt(pageSize) }).map((_, index) => (
      <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" align="flex-start" mb="xs">
            <Skeleton height={24} width="70%" />
            <Group gap={5}>
              <Skeleton height={32} width={32} radius="md" />
              <Skeleton height={32} width={32} radius="md" />
            </Group>
          </Group>
          <Group mb="xs">
            <Skeleton height={20} width={60} radius="sm" />
          </Group>
          <Skeleton height={16} width="100%" mb={4} />
          <Skeleton height={16} width="80%" mb={4} />
          <Skeleton height={16} width="60%" />
        </Card>
      </Grid.Col>
    ));
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Container size="lg">
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <Title order={1} c="white">
            My Tasks
          </Title>
          <Button
            leftSection={<IconLogout size="1rem" />}
            variant="white"
            color="red"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Group>

        {/* Create Task Form */}
        <Paper shadow="xl" p={30} radius="lg" mb="xl">
          <Title order={3} mb="md" c="dark">
            Create New Task
          </Title>
          <Stack gap="md">
            <TextInput
              label="Task Title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              required
            />
            <Textarea
              label="Description"
              placeholder="Enter task description (optional)"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              minRows={3}
            />
            <Select
              label="Priority"
              placeholder="Select priority"
              value={priority}
              onChange={(value) => setPriority(value || 'medium')}
              data={PRIORITY_OPTIONS}
              required
              clearable={false}
              searchable={false}
            />
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={createTask}
              loading={loading}
              disabled={loading}
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                border: 'none',
              }}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </Stack>
        </Paper>

        {/* Tasks List */}
        <Paper shadow="xl" p={30} radius="lg">
          {/* Header with search */}
          <Group justify="space-between" align="center" mb="md" wrap="wrap">
            <Group gap="md">
              <Title order={3} c="dark">
                Your Tasks
              </Title>
              <Badge size="lg" variant="light" color="blue">
                {totalTasks} task{totalTasks !== 1 ? 's' : ''} 
                {totalTasks !== allTasks.length && ` of ${allTasks.length}`}
              </Badge>
              {hasActiveSearch && (
                <Badge size="sm" variant="filled" color="orange">
                  Filtered
                </Badge>
              )}
            </Group>
            
            <Group gap="xs">
              <Text size="sm" c="dimmed">Show:</Text>
              <Select
                value={pageSize}
                onChange={(value) => setPageSize(value || '6')}
                data={[
                  { value: '3', label: '3 per page' },
                  { value: '6', label: '6 per page' },
                  { value: '9', label: '9 per page' },
                  { value: '12', label: '12 per page' },
                ]}
                size="xs"
                w={120}
              />
            </Group>
          </Group>

          {/* Search Bar */}
          <TextInput
            leftSection={<IconSearch size="1rem" />}
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            mb="md"
            size="sm"
            rightSection={
              searchQuery ? (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => setSearchQuery('')}
                  size="sm"
                >
                  <IconX size="0.8rem" />
                </ActionIcon>
              ) : null
            }
          />

          {/* Tasks Grid */}
          {tasksLoading ? (
            <Grid>
              {renderTaskSkeleton()}
            </Grid>
          ) : totalTasks === 0 ? (
            <Box ta="center" py={50}>
              <Text c="dimmed" size="lg">
                {allTasks.length === 0 
                  ? "No tasks yet. Create your first task above!" 
                  : "No tasks match your search. Try a different search term."
                }
              </Text>
              {hasActiveSearch && allTasks.length > 0 && (
                <Button
                  variant="subtle"
                  onClick={() => setSearchQuery('')}
                  mt="md"
                >
                  Clear search to see all tasks
                </Button>
              )}
            </Box>
          ) : (
            <>
              <Grid>
                {paginatedTasks.map((task) => (
                  <Grid.Col key={task.id} span={{ base: 12, md: 6, lg: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Group justify="space-between" align="flex-start" mb="xs">
                        <Text fw={500} size="lg" lineClamp={1}>
                          {task.title}
                        </Text>
                        <Group gap={5}>
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => openEditModal(task)}
                          >
                            <IconEdit size="1rem" />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => deleteTask(task.id)}
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Group>
                      </Group>

                      <Group mb="xs">
                        <Badge 
                          color={PRIORITY_COLORS[task.priority || 'medium']} 
                          variant="light"
                          size="sm"
                        >
                          {PRIORITY_LABELS[task.priority || 'medium']}
                        </Badge>
                      </Group>

                      <Text size="sm" c="dimmed" lineClamp={3}>
                        {task.description || 'No description provided'}
                      </Text>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Center mt="xl">
                  <Stack align="center" gap="sm">
                    <Pagination
                      value={currentPage}
                      onChange={setCurrentPage}
                      total={totalPages}
                      size="md"
                      radius="lg"
                      withEdges
                      style={{
                        '.mantine-Pagination-control[data-active]': {
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          border: 'none',
                        }
                      }}
                    />
                    <Text size="sm" c="dimmed">
                      Page {currentPage} of {totalPages} ({totalTasks} {hasActiveSearch ? 'filtered' : 'total'} tasks)
                    </Text>
                  </Stack>
                </Center>
              )}
            </>
          )}
        </Paper>

        {/* Edit Modal */}
        <Modal
          opened={opened}
          onClose={close}
          title="Edit Task"
          size="md"
          centered
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}
        >
          <Stack gap="md">
            <TextInput
              label="Task Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.currentTarget.value)}
              placeholder="Enter task title"
              required
            />
            <Textarea
              label="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.currentTarget.value)}
              placeholder="Enter task description"
              minRows={3}
            />
            <Select
              label="Priority"
              value={editPriority}
              onChange={(value) => setEditPriority(value || 'medium')}
              data={PRIORITY_OPTIONS}
              required
              clearable={false}
              searchable={false}
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="outline" color="gray" onClick={close}>
                Cancel
              </Button>
              <Button
                onClick={updateTask}
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  border: 'none',
                }}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </Box>
  );
}