import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Plus,
  Search,
  Sparkles,
  Target,
  Users,
  X
} from 'lucide-react'

type Student = {
  id: string
  name: string
  exam: string
  role: string
  weeklyGoal: number
  streak: number
}

type Task = {
  id: string
  studentId: string
  subject: string
  title: string
  description: string
  minutes: number
  questions?: number
  due: string
  priority: 'Alta' | 'Normal'
  done: boolean
}

const today = new Date().toISOString().slice(0, 10)

const students: Student[] = [
  { id: '1', name: 'Marina Costa', exam: 'TJ-GO', role: 'Analista Judiciário', weeklyGoal: 18, streak: 6 },
  { id: '2', name: 'Lucas Almeida', exam: 'TJ-SP', role: 'Escrevente Técnico', weeklyGoal: 15, streak: 3 },
  { id: '3', name: 'Renata Souza', exam: 'TRT-18', role: 'Técnico Judiciário', weeklyGoal: 20, streak: 9 },
]

const seedTasks: Task[] = [
  {
    id: 't1', studentId: '1', subject: 'Direito Constitucional',
    title: 'Direitos e garantias fundamentais', description: 'CF, art. 5º — leitura dirigida + marcação dos incisos mais cobrados.',
    minutes: 50, questions: 20, due: today, priority: 'Alta', done: false,
  },
  {
    id: 't2', studentId: '1', subject: 'Direito Administrativo',
    title: 'Atos administrativos', description: 'Revisar resumo-base e resolver questões do tópico.',
    minutes: 45, questions: 25, due: today, priority: 'Normal', done: true,
  },
  {
    id: 't3', studentId: '1', subject: 'Português',
    title: 'Interpretação de textos', description: 'Resolver bateria focada em inferência e sentido contextual.',
    minutes: 35, questions: 15, due: today, priority: 'Normal', done: false,
  },
  {
    id: 't4', studentId: '2', subject: 'Direito Penal',
    title: 'Crimes contra a Administração', description: 'CP, arts. 312 a 327 + 20 questões.',
    minutes: 60, questions: 20, due: today, priority: 'Alta', done: false,
  },
]

function useStoredTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tja-tasks-v1')
    return saved ? JSON.parse(saved) : seedTasks
  })

  useEffect(() => {
    localStorage.setItem('tja-tasks-v1', JSON.stringify(tasks))
  }, [tasks])

  return [tasks, setTasks] as const
}

export default function App() {
  const [mode, setMode] = useState<'mentor' | 'student'>('mentor')
  const [selectedStudent, setSelectedStudent] = useState('1')
  const [tasks, setTasks] = useStoredTasks()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const student = students.find(s => s.id === selectedStudent) ?? students[0]
  const studentTasks = tasks.filter(t => t.studentId === selectedStudent)
  const todayTasks = studentTasks.filter(t => t.due === today)
  const completedToday = todayTasks.filter(t => t.done).length
  const progress = todayTasks.length ? Math.round((completedToday / todayTasks.length) * 100) : 0

  const filteredStudents = students.filter(s =>
    (s.name + s.exam + s.role).toLowerCase().includes(search.toLowerCase())
  )

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function addTask(task: Omit<Task, 'id' | 'done'>) {
    setTasks(prev => [{ ...task, id: crypto.randomUUID(), done: false }, ...prev])
    setShowForm(false)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">TJ</div>
          <div>
            <strong>TJ Academy</strong>
            <span>Mentoria</span>
          </div>
        </div>

        <div className="mode-switch" aria-label="Alternar visão">
          <button className={mode === 'mentor' ? 'active' : ''} onClick={() => setMode('mentor')}>Mentor</button>
          <button className={mode === 'student' ? 'active' : ''} onClick={() => setMode('student')}>Aluno</button>
        </div>
      </header>

      {mode === 'mentor' ? (
        <MentorView
          students={filteredStudents}
          selectedStudent={selectedStudent}
          onSelectStudent={setSelectedStudent}
          search={search}
          setSearch={setSearch}
          tasks={tasks}
          progress={progress}
          onNewTask={() => setShowForm(true)}
        />
      ) : (
        <StudentView student={student} tasks={todayTasks} progress={progress} onToggle={toggleTask} />
      )}

      {showForm && (
        <TaskForm
          students={students}
          initialStudentId={selectedStudent}
          onClose={() => setShowForm(false)}
          onSubmit={addTask}
        />
      )}
    </div>
  )
}

function MentorView(props: {
  students: Student[]
  selectedStudent: string
  onSelectStudent: (id: string) => void
  search: string
  setSearch: (value: string) => void
  tasks: Task[]
  progress: number
  onNewTask: () => void
}) {
  const student = students.find(s => s.id === props.selectedStudent) ?? students[0]
  const tasks = props.tasks.filter(t => t.studentId === student?.id)
  const todayTasks = tasks.filter(t => t.due === today)
  const minutes = todayTasks.reduce((sum, t) => sum + t.minutes, 0)
  const questions = todayTasks.reduce((sum, t) => sum + (t.questions ?? 0), 0)

  return (
    <main className="mentor-layout">
      <aside className="sidebar">
        <nav>
          <a className="nav-item active"><LayoutDashboard size={18}/> Visão geral</a>
          <a className="nav-item"><Users size={18}/> Alunos</a>
          <a className="nav-item"><ListChecks size={18}/> Planejamento</a>
          <a className="nav-item"><BarChart3 size={18}/> Desempenho</a>
        </nav>
        <div className="sidebar-note">
          <Sparkles size={17}/>
          <div>
            <strong>Fluxo do MVP</strong>
            <span>Você define. O aluno executa. Os dados voltam para você.</span>
          </div>
        </div>
      </aside>

      <section className="content mentor-content">
        <div className="page-heading">
          <div>
            <span className="eyebrow">PAINEL DO MENTOR</span>
            <h1>Seus alunos, sem planilha.</h1>
            <p>Acompanhe execução e diga exatamente o que cada aluno deve fazer.</p>
          </div>
          <button className="primary-btn" onClick={props.onNewTask}><Plus size={18}/> Nova tarefa</button>
        </div>

        <div className="mentor-grid">
          <div className="students-card card">
            <div className="card-head">
              <div>
                <h2>Alunos</h2>
                <span>{props.students.length} acompanhados</span>
              </div>
            </div>
            <label className="search-box">
              <Search size={17}/>
              <input value={props.search} onChange={e => props.setSearch(e.target.value)} placeholder="Buscar aluno..." />
            </label>
            <div className="student-list">
              {props.students.map(s => {
                const studentTasks = props.tasks.filter(t => t.studentId === s.id && t.due === today)
                const done = studentTasks.filter(t => t.done).length
                const pct = studentTasks.length ? Math.round(done / studentTasks.length * 100) : 0
                return (
                  <button key={s.id} className={'student-row ' + (s.id === props.selectedStudent ? 'selected' : '')} onClick={() => props.onSelectStudent(s.id)}>
                    <div className="avatar">{s.name.split(' ').map(n => n[0]).slice(0,2).join('')}</div>
                    <div className="student-row-main">
                      <strong>{s.name}</strong>
                      <span>{s.exam} · {s.role}</span>
                    </div>
                    <div className="mini-progress">
                      <span>{pct}%</span>
                      <ChevronRight size={17}/>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="student-detail">
            <div className="profile-card card">
              <div className="profile-top">
                <div>
                  <span className="eyebrow">ALUNO SELECIONADO</span>
                  <h2>{student.name}</h2>
                  <p>{student.exam} · {student.role}</p>
                </div>
                <div className="status-pill"><span/> Acompanhamento ativo</div>
              </div>

              <div className="stats-row">
                <Stat icon={<Target size={19}/>} label="Execução hoje" value={props.progress + '%'} />
                <Stat icon={<Clock3 size={19}/>} label="Carga de hoje" value={formatMinutes(minutes)} />
                <Stat icon={<BookOpen size={19}/>} label="Questões" value={String(questions)} />
                <Stat icon={<CalendarDays size={19}/>} label="Sequência" value={student.streak + ' dias'} />
              </div>
            </div>

            <div className="card plan-card">
              <div className="card-head">
                <div>
                  <h2>Plano de hoje</h2>
                  <span>{todayTasks.length} tarefas cadastradas</span>
                </div>
                <button className="text-btn" onClick={props.onNewTask}>Adicionar tarefa <Plus size={16}/></button>
              </div>

              {todayTasks.length === 0 ? (
                <div className="empty-state">
                  <ListChecks size={32}/>
                  <strong>Nenhuma tarefa para hoje.</strong>
                  <span>Cadastre o que este aluno precisa executar.</span>
                </div>
              ) : (
                <div className="task-list">
                  {todayTasks.map(task => <MentorTask key={task.id} task={task}/>)}
                </div>
              )}
            </div>

            <div className="insight-card">
              <div className="insight-icon"><Sparkles size={20}/></div>
              <div>
                <span className="eyebrow">ANÁLISE RÁPIDA</span>
                <strong>{props.progress < 50 ? 'Execução abaixo do esperado.' : 'Execução dentro do planejamento.'}</strong>
                <p>
                  {props.progress < 50
                    ? 'Antes de aumentar a carga, verifique se as tarefas atuais cabem na rotina real do aluno.'
                    : 'Mantenha a carga e observe o desempenho nas questões antes do próximo ajuste.'}
                </p>
              </div>
              <ArrowRight size={19}/>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function MentorTask({ task }: { task: Task }) {
  return (
    <div className="mentor-task">
      <div className={'task-state ' + (task.done ? 'done' : '')}>
        {task.done ? <Check size={15}/> : <Circle size={15}/>}
      </div>
      <div className="task-copy">
        <div className="task-meta">
          <span>{task.subject}</span>
          {task.priority === 'Alta' && <span className="priority">Prioridade alta</span>}
        </div>
        <strong>{task.title}</strong>
        <p>{task.description}</p>
      </div>
      <div className="task-numbers">
        <span><Clock3 size={14}/>{task.minutes} min</span>
        {!!task.questions && <span><ListChecks size={14}/>{task.questions} questões</span>}
      </div>
    </div>
  )
}

function StudentView({ student, tasks, progress, onToggle }: {
  student: Student
  tasks: Task[]
  progress: number
  onToggle: (id: string) => void
}) {
  const remainingMinutes = tasks.filter(t => !t.done).reduce((s, t) => s + t.minutes, 0)

  return (
    <main className="student-page">
      <section className="student-hero">
        <div>
          <span className="eyebrow">SÁBADO · PLANO DE ESTUDO</span>
          <h1>Bom estudo, {student.name.split(' ')[0]}.</h1>
          <p>Seu trabalho hoje é simples: execute o plano. O resto fica com a mentoria.</p>
        </div>
        <div className="exam-chip"><GraduationCap size={18}/>{student.exam} · {student.role}</div>
      </section>

      <section className="student-progress-card card">
        <div className="progress-copy">
          <span>Execução de hoje</span>
          <strong>{progress}%</strong>
        </div>
        <div className="big-progress"><i style={{ width: progress + '%' }}/></div>
        <div className="progress-foot">
          <span>{tasks.filter(t => t.done).length} de {tasks.length} tarefas concluídas</span>
          <span>{formatMinutes(remainingMinutes)} restantes</span>
        </div>
      </section>

      <section className="today-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">O QUE FAZER AGORA</span>
            <h2>Seu plano de hoje</h2>
          </div>
          <span className="focus-badge">Sem decidir. Só executar.</span>
        </div>

        <div className="student-task-list">
          {tasks.map((task, index) => (
            <button key={task.id} className={'student-task ' + (task.done ? 'completed' : '')} onClick={() => onToggle(task.id)}>
              <div className="task-order">{task.done ? <CheckCircle2 size={24}/> : String(index + 1).padStart(2, '0')}</div>
              <div className="student-task-copy">
                <div className="task-meta">
                  <span>{task.subject}</span>
                  {task.priority === 'Alta' && <span className="priority">Prioridade</span>}
                </div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <div className="student-task-stats">
                  <span><Clock3 size={15}/>{task.minutes} min</span>
                  {!!task.questions && <span><ListChecks size={15}/>{task.questions} questões</span>}
                </div>
              </div>
              <div className="check-control">{task.done ? 'Concluída' : 'Marcar como feita'} <ChevronRight size={18}/></div>
            </button>
          ))}
        </div>
      </section>

      <section className="mentor-message">
        <div className="avatar mentor-avatar">PG</div>
        <div>
          <span>Orientação do mentor</span>
          <p>Não compense atraso aumentando a carga de hoje. Cumpra o plano na ordem e registre o que realmente conseguiu fazer.</p>
        </div>
      </section>
    </main>
  )
}

function TaskForm({ students, initialStudentId, onClose, onSubmit }: {
  students: Student[]
  initialStudentId: string
  onClose: () => void
  onSubmit: (task: Omit<Task, 'id' | 'done'>) => void
}) {
  const [form, setForm] = useState({
    studentId: initialStudentId,
    subject: 'Direito Constitucional',
    title: '',
    description: '',
    minutes: 45,
    questions: 20,
    due: today,
    priority: 'Normal' as 'Alta' | 'Normal'
  })

  const canSubmit = form.title.trim().length > 2 && form.description.trim().length > 2

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="eyebrow">PLANEJAMENTO INDIVIDUAL</span>
            <h2>Nova tarefa</h2>
            <p>Cadastre a orientação de forma objetiva. O aluno recebe exatamente isso.</p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20}/></button>
        </div>

        <div className="form-grid">
          <label>
            <span>Aluno</span>
            <select value={form.studentId} onChange={e => setForm({...form, studentId:e.target.value})}>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} · {s.exam}</option>)}
            </select>
          </label>
          <label>
            <span>Matéria</span>
            <input value={form.subject} onChange={e => setForm({...form, subject:e.target.value})}/>
          </label>
          <label className="full">
            <span>O que ele precisa fazer</span>
            <input autoFocus placeholder="Ex.: Direitos e garantias fundamentais" value={form.title} onChange={e => setForm({...form, title:e.target.value})}/>
          </label>
          <label className="full">
            <span>Orientação objetiva</span>
            <textarea rows={4} placeholder="Ex.: Ler CF, art. 5º, revisar marcações e resolver 20 questões..." value={form.description} onChange={e => setForm({...form, description:e.target.value})}/>
          </label>
          <label>
            <span>Tempo estimado</span>
            <div className="suffix-input"><input type="number" min="10" step="5" value={form.minutes} onChange={e => setForm({...form, minutes:Number(e.target.value)})}/><b>min</b></div>
          </label>
          <label>
            <span>Questões</span>
            <input type="number" min="0" value={form.questions} onChange={e => setForm({...form, questions:Number(e.target.value)})}/>
          </label>
          <label>
            <span>Data</span>
            <input type="date" value={form.due} onChange={e => setForm({...form, due:e.target.value})}/>
          </label>
          <label>
            <span>Prioridade</span>
            <select value={form.priority} onChange={e => setForm({...form, priority:e.target.value as 'Alta' | 'Normal'})}>
              <option>Normal</option>
              <option>Alta</option>
            </select>
          </label>
        </div>

        <div className="smart-hint">
          <Sparkles size={18}/>
          <div>
            <strong>Próxima camada inteligente</strong>
            <span>Depois do teste, esta tela pode sugerir carga e tarefas com base em edital, desempenho, atrasos e disponibilidade do aluno.</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>Cancelar</button>
          <button className="primary-btn" disabled={!canSubmit} onClick={() => canSubmit && onSubmit(form)}>Cadastrar tarefa <ArrowRight size={17}/></button>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return <div className="stat"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return minutes + ' min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? h + 'h ' + m + 'min' : h + 'h'
}
