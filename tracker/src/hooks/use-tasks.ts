import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TaskAssignment, TeamMember, ChecklistItem, Milestone, TaskStatus } from '../lib/types'

export interface TaskFull extends Task {
  assignments: (TaskAssignment & { team_members: TeamMember })[]
}

export function useTasks() {
  const [tasks, setTasks] = useState<TaskFull[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*, task_assignments(*, team_members(*))')
      .order('start_date')
    if (data) {
      setTasks(
        data.map((t: any) => ({
          ...t,
          assignments: t.task_assignments || [],
        }))
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_checklist' }, fetchTasks)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchTasks])

  const updateStatus = async (taskId: string, status: TaskStatus) => {
    await supabase.from('tasks').update({ status }).eq('task_id', taskId)
    await fetchTasks()
  }

  return { tasks, loading, updateStatus, refetch: fetchTasks }
}

export function useChecklist(taskId: string) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from('task_checklist')
      .select('*')
      .eq('task_id', taskId)
      .order('category')
      .order('sort_order')
    if (data) setItems(data)
    setLoading(false)
  }, [taskId])

  useEffect(() => {
    fetchItems()
    const channel = supabase
      .channel(`checklist-${taskId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_checklist', filter: `task_id=eq.${taskId}` }, fetchItems)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [taskId, fetchItems])

  const toggleItem = async (itemId: string, checked: boolean, userId: string) => {
    await supabase.from('task_checklist').update({
      is_checked: checked,
      checked_by: checked ? userId : null,
      checked_at: checked ? new Date().toISOString() : null,
    }).eq('id', itemId)
    await fetchItems()
  }

  return { items, loading, toggleItem }
}

export function useComments(taskId: string) {
  const [comments, setComments] = useState<any[]>([])

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('task_comments')
      .select('*, team_members(*)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    if (data) setComments(data)
  }, [taskId])

  useEffect(() => {
    fetchComments()
    const channel = supabase
      .channel(`comments-${taskId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_comments', filter: `task_id=eq.${taskId}` }, fetchComments)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [taskId, fetchComments])

  const addComment = async (authorId: string, content: string) => {
    await supabase.from('task_comments').insert({ task_id: taskId, author_id: authorId, content })
    await fetchComments()
  }

  const editComment = async (commentId: string, content: string) => {
    await supabase.from('task_comments').update({ content, updated_at: new Date().toISOString() }).eq('id', commentId)
    await fetchComments()
  }

  const deleteComment = async (commentId: string) => {
    await supabase.from('task_comments').delete().eq('id', commentId)
    await fetchComments()
  }

  return { comments, addComment, editComment, deleteComment }
}

export function useMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([])

  useEffect(() => {
    supabase.from('milestones').select('*').order('target_date').then(({ data }) => {
      if (data) setMilestones(data)
    })
  }, [])

  const toggleMilestone = async (id: string, completed: boolean) => {
    await supabase.from('milestones').update({
      is_completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
    }).eq('id', id)
    const { data } = await supabase.from('milestones').select('*').order('target_date')
    if (data) setMilestones(data)
  }

  return { milestones, toggleMilestone }
}
