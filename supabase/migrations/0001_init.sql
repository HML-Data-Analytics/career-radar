-- Career Radar — Phase 1 schema
-- Every user-owned table has user_id referencing auth.users and RLS
-- restricting access to the owning user. No cross-user reads/writes.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users with app-level profile data)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);
create policy "profiles_delete_own" on profiles
  for delete using (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Generic helper to add standard "owner-only" RLS policies to a table that
-- has a user_id uuid column. Run per-table below (Postgres has no loops at
-- top-level DDL, so each table gets explicit policies for clarity/auditability).
-- ---------------------------------------------------------------------------

-- ============================================================
-- CAREER DNA
-- ============================================================

create table career_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  headline text,
  professional_summary text,
  years_of_experience numeric,
  current_title text,
  current_company text,
  current_location text,
  career_level text,
  career_direction text,
  career_ambition text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table career_profiles enable row level security;
create policy "career_profiles_owner_select" on career_profiles for select using (auth.uid() = user_id);
create policy "career_profiles_owner_insert" on career_profiles for insert with check (auth.uid() = user_id);
create policy "career_profiles_owner_update" on career_profiles for update using (auth.uid() = user_id);
create policy "career_profiles_owner_delete" on career_profiles for delete using (auth.uid() = user_id);
create trigger career_profiles_set_updated_at before update on career_profiles for each row execute function set_updated_at();
create index career_profiles_user_id_idx on career_profiles(user_id);

create table career_experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  title text not null,
  location text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  description text,
  responsibilities text[],
  achievements text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table career_experiences enable row level security;
create policy "career_experiences_owner_select" on career_experiences for select using (auth.uid() = user_id);
create policy "career_experiences_owner_insert" on career_experiences for insert with check (auth.uid() = user_id);
create policy "career_experiences_owner_update" on career_experiences for update using (auth.uid() = user_id);
create policy "career_experiences_owner_delete" on career_experiences for delete using (auth.uid() = user_id);
create trigger career_experiences_set_updated_at before update on career_experiences for each row execute function set_updated_at();
create index career_experiences_user_id_idx on career_experiences(user_id);

create table career_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid references career_experiences(id) on delete set null,
  title text not null,
  description text,
  impact text,
  metrics text,
  skills text[],
  technologies text[],
  industry text,
  leadership_scope text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table career_achievements enable row level security;
create policy "career_achievements_owner_select" on career_achievements for select using (auth.uid() = user_id);
create policy "career_achievements_owner_insert" on career_achievements for insert with check (auth.uid() = user_id);
create policy "career_achievements_owner_update" on career_achievements for update using (auth.uid() = user_id);
create policy "career_achievements_owner_delete" on career_achievements for delete using (auth.uid() = user_id);
create trigger career_achievements_set_updated_at before update on career_achievements for each row execute function set_updated_at();
create index career_achievements_user_id_idx on career_achievements(user_id);
create index career_achievements_experience_id_idx on career_achievements(experience_id);

create table career_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill text not null,
  category text,
  proficiency text,
  years_experience numeric,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table career_skills enable row level security;
create policy "career_skills_owner_select" on career_skills for select using (auth.uid() = user_id);
create policy "career_skills_owner_insert" on career_skills for insert with check (auth.uid() = user_id);
create policy "career_skills_owner_update" on career_skills for update using (auth.uid() = user_id);
create policy "career_skills_owner_delete" on career_skills for delete using (auth.uid() = user_id);
create trigger career_skills_set_updated_at before update on career_skills for each row execute function set_updated_at();
create index career_skills_user_id_idx on career_skills(user_id);

create table career_certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  issuer text,
  issue_date date,
  credential text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table career_certifications enable row level security;
create policy "career_certifications_owner_select" on career_certifications for select using (auth.uid() = user_id);
create policy "career_certifications_owner_insert" on career_certifications for insert with check (auth.uid() = user_id);
create policy "career_certifications_owner_update" on career_certifications for update using (auth.uid() = user_id);
create policy "career_certifications_owner_delete" on career_certifications for delete using (auth.uid() = user_id);
create trigger career_certifications_set_updated_at before update on career_certifications for each row execute function set_updated_at();
create index career_certifications_user_id_idx on career_certifications(user_id);

create table career_education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution text not null,
  degree text,
  field text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table career_education enable row level security;
create policy "career_education_owner_select" on career_education for select using (auth.uid() = user_id);
create policy "career_education_owner_insert" on career_education for insert with check (auth.uid() = user_id);
create policy "career_education_owner_update" on career_education for update using (auth.uid() = user_id);
create policy "career_education_owner_delete" on career_education for delete using (auth.uid() = user_id);
create trigger career_education_set_updated_at before update on career_education for each row execute function set_updated_at();
create index career_education_user_id_idx on career_education(user_id);

-- Evidence layer: manually-added proof supporting resume/JD claims.
create table career_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid references career_experiences(id) on delete set null,
  type text not null check (type in (
    'project', 'achievement', 'leadership', 'technical_implementation',
    'business_result', 'certification', 'client_experience', 'industry_experience', 'other'
  )),
  title text not null,
  description text,
  source text,
  evidence_date date,
  related_skills text[],
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table career_evidence enable row level security;
create policy "career_evidence_owner_select" on career_evidence for select using (auth.uid() = user_id);
create policy "career_evidence_owner_insert" on career_evidence for insert with check (auth.uid() = user_id);
create policy "career_evidence_owner_update" on career_evidence for update using (auth.uid() = user_id);
create policy "career_evidence_owner_delete" on career_evidence for delete using (auth.uid() = user_id);
create trigger career_evidence_set_updated_at before update on career_evidence for each row execute function set_updated_at();
create index career_evidence_user_id_idx on career_evidence(user_id);

-- ============================================================
-- PREFERENCES & GOALS
-- ============================================================

create table career_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  target_roles text[],
  target_titles text[],
  seniority text[],
  industries text[],
  locations text[],
  remote_preference text check (remote_preference in ('remote', 'hybrid', 'on_site', 'no_preference')),
  min_salary numeric,
  salary_currency text,
  employment_type text[],
  preferred_companies text[],
  excluded_companies text[],
  required_technologies text[],
  preferred_technologies text[],
  max_commute_minutes integer,
  visa_sponsorship_needed boolean,
  open_to_relocation boolean,
  travel_tolerance text,
  career_direction text,
  preferred_company_size text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table career_preferences enable row level security;
create policy "career_preferences_owner_select" on career_preferences for select using (auth.uid() = user_id);
create policy "career_preferences_owner_insert" on career_preferences for insert with check (auth.uid() = user_id);
create policy "career_preferences_owner_update" on career_preferences for update using (auth.uid() = user_id);
create policy "career_preferences_owner_delete" on career_preferences for delete using (auth.uid() = user_id);
create trigger career_preferences_set_updated_at before update on career_preferences for each row execute function set_updated_at();

create table career_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  status text not null default 'active' check (status in ('active', 'achieved', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table career_goals enable row level security;
create policy "career_goals_owner_select" on career_goals for select using (auth.uid() = user_id);
create policy "career_goals_owner_insert" on career_goals for insert with check (auth.uid() = user_id);
create policy "career_goals_owner_update" on career_goals for update using (auth.uid() = user_id);
create policy "career_goals_owner_delete" on career_goals for delete using (auth.uid() = user_id);
create trigger career_goals_set_updated_at before update on career_goals for each row execute function set_updated_at();
create index career_goals_user_id_idx on career_goals(user_id);

-- ============================================================
-- RESUMES
-- ============================================================

create table master_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Master Resume',
  file_path text,
  file_type text,
  parsed_content jsonb,
  raw_text text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table master_resumes enable row level security;
create policy "master_resumes_owner_select" on master_resumes for select using (auth.uid() = user_id);
create policy "master_resumes_owner_insert" on master_resumes for insert with check (auth.uid() = user_id);
create policy "master_resumes_owner_update" on master_resumes for update using (auth.uid() = user_id);
create policy "master_resumes_owner_delete" on master_resumes for delete using (auth.uid() = user_id);
create trigger master_resumes_set_updated_at before update on master_resumes for each row execute function set_updated_at();
create index master_resumes_user_id_idx on master_resumes(user_id);

create table resume_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  master_resume_id uuid references master_resumes(id) on delete set null,
  job_id uuid, -- fk added after jobs table is created
  title text not null,
  state text not null default 'DRAFT' check (state in ('DRAFT', 'GENERATED', 'USER_EDITED', 'APPROVED', 'ARCHIVED')),
  tailoring_intensity text check (tailoring_intensity in ('conservative', 'balanced', 'aggressive')),
  template text default 'modern' check (template in ('modern', 'executive', 'ats_minimal')),
  content jsonb,
  quality_scores jsonb,
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table resume_versions enable row level security;
create policy "resume_versions_owner_select" on resume_versions for select using (auth.uid() = user_id);
create policy "resume_versions_owner_insert" on resume_versions for insert with check (auth.uid() = user_id);
create policy "resume_versions_owner_update" on resume_versions for update using (auth.uid() = user_id);
create policy "resume_versions_owner_delete" on resume_versions for delete using (auth.uid() = user_id);
create trigger resume_versions_set_updated_at before update on resume_versions for each row execute function set_updated_at();
create index resume_versions_user_id_idx on resume_versions(user_id);
create index resume_versions_master_resume_id_idx on resume_versions(master_resume_id);

-- ============================================================
-- JOBS & SOURCES
-- ============================================================

create table job_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('api', 'manual_url', 'manual_paste', 'greenhouse', 'lever', 'other')),
  is_active boolean not null default true,
  config jsonb,
  created_at timestamptz not null default now()
);
-- job_sources is shared reference data, not user-owned; readable by any
-- authenticated user, writable only via service role.
alter table job_sources enable row level security;
create policy "job_sources_authenticated_select" on job_sources for select using (auth.role() = 'authenticated');

create table jobs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references job_sources(id) on delete set null,
  source_job_id text,
  title text not null,
  company text not null,
  location text,
  remote_type text check (remote_type in ('remote', 'hybrid', 'on_site', 'unknown')),
  employment_type text,
  salary_min numeric,
  salary_max numeric,
  currency text,
  description text not null,
  requirements text[],
  responsibilities text[],
  skills text[],
  technologies text[],
  industry text,
  seniority text,
  job_url text,
  application_url text,
  posted_date date,
  discovered_date timestamptz not null default now(),
  content_hash text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- jobs are shared/deduplicated reference data (discovered by any user via
-- manual paste/URL or a shared source feed); readable by any authenticated
-- user. User-specific relationships (saved, matched, tracked) are modeled in
-- their own owner-scoped tables below.
alter table jobs enable row level security;
create policy "jobs_authenticated_select" on jobs for select using (auth.role() = 'authenticated');
create policy "jobs_authenticated_insert" on jobs for insert with check (auth.role() = 'authenticated');
create trigger jobs_set_updated_at before update on jobs for each row execute function set_updated_at();
create unique index jobs_content_hash_idx on jobs(content_hash);
create index jobs_source_id_idx on jobs(source_id);
create index jobs_company_idx on jobs(company);

alter table resume_versions
  add constraint resume_versions_job_id_fkey foreign key (job_id) references jobs(id) on delete set null;

create table job_intelligence (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  explicit_requirements jsonb,
  inferred_priorities jsonb,
  hidden_signals jsonb,
  red_flags jsonb,
  prompt_version text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Derived from a shared job; readable by any authenticated user, written
-- only by server-side AI pipeline (service role).
alter table job_intelligence enable row level security;
create policy "job_intelligence_authenticated_select" on job_intelligence for select using (auth.role() = 'authenticated');
create trigger job_intelligence_set_updated_at before update on job_intelligence for each row execute function set_updated_at();
create unique index job_intelligence_job_id_idx on job_intelligence(job_id);

-- ============================================================
-- COMPANY INTELLIGENCE
-- ============================================================

create table company_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  industry text,
  size text,
  location text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table company_profiles enable row level security;
create policy "company_profiles_authenticated_select" on company_profiles for select using (auth.role() = 'authenticated');
create trigger company_profiles_set_updated_at before update on company_profiles for each row execute function set_updated_at();

create table company_intelligence (
  id uuid primary key default gen_random_uuid(),
  company_profile_id uuid not null references company_profiles(id) on delete cascade,
  growth_indicators jsonb,
  leadership jsonb,
  technology_environment jsonb,
  recent_news jsonb,
  reputation_summary text,
  salary_data jsonb,
  restructuring_signals jsonb,
  fit_score integer check (fit_score between 0 and 100),
  strengths text[],
  concerns text[],
  sources jsonb,
  prompt_version text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table company_intelligence enable row level security;
create policy "company_intelligence_authenticated_select" on company_intelligence for select using (auth.role() = 'authenticated');
create trigger company_intelligence_set_updated_at before update on company_intelligence for each row execute function set_updated_at();
create index company_intelligence_company_profile_id_idx on company_intelligence(company_profile_id);

-- ============================================================
-- USER <-> JOB RELATIONSHIPS (owner-scoped)
-- ============================================================

create table saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, job_id)
);
alter table saved_jobs enable row level security;
create policy "saved_jobs_owner_select" on saved_jobs for select using (auth.uid() = user_id);
create policy "saved_jobs_owner_insert" on saved_jobs for insert with check (auth.uid() = user_id);
create policy "saved_jobs_owner_update" on saved_jobs for update using (auth.uid() = user_id);
create policy "saved_jobs_owner_delete" on saved_jobs for delete using (auth.uid() = user_id);
create index saved_jobs_user_id_idx on saved_jobs(user_id);
create index saved_jobs_job_id_idx on saved_jobs(job_id);

create table job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  overall_score integer check (overall_score between 0 and 100),
  qualification_score integer check (qualification_score between 0 and 100),
  career_fit_score integer check (career_fit_score between 0 and 100),
  opportunity_quality_score integer check (opportunity_quality_score between 0 and 100),
  dimension_scores jsonb,
  recommendation text check (recommendation in (
    'STRONGLY_RECOMMEND', 'RECOMMEND', 'CONSIDER', 'WEAK_MATCH', 'NOT_RECOMMENDED'
  )),
  career_progression text check (career_progression in (
    'promotion', 'lateral_move', 'strategic_pivot', 'downgrade', 'temporary_step', 'unclear'
  )),
  strengths jsonb,
  gaps jsonb,
  transferable_experience jsonb,
  reasoning text,
  should_apply boolean,
  should_apply_reasons text[],
  prompt_version text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);
alter table job_matches enable row level security;
create policy "job_matches_owner_select" on job_matches for select using (auth.uid() = user_id);
create policy "job_matches_owner_insert" on job_matches for insert with check (auth.uid() = user_id);
create policy "job_matches_owner_update" on job_matches for update using (auth.uid() = user_id);
create policy "job_matches_owner_delete" on job_matches for delete using (auth.uid() = user_id);
create trigger job_matches_set_updated_at before update on job_matches for each row execute function set_updated_at();
create index job_matches_user_id_idx on job_matches(user_id);
create index job_matches_job_id_idx on job_matches(job_id);

create table career_gaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  job_match_id uuid references job_matches(id) on delete cascade,
  requirement text not null,
  evidence_summary text,
  gap_severity text check (gap_severity in ('none', 'low', 'medium', 'high')),
  impact text check (impact in ('low', 'medium', 'high')),
  recommendation text,
  created_at timestamptz not null default now()
);
alter table career_gaps enable row level security;
create policy "career_gaps_owner_select" on career_gaps for select using (auth.uid() = user_id);
create policy "career_gaps_owner_insert" on career_gaps for insert with check (auth.uid() = user_id);
create policy "career_gaps_owner_update" on career_gaps for update using (auth.uid() = user_id);
create policy "career_gaps_owner_delete" on career_gaps for delete using (auth.uid() = user_id);
create index career_gaps_user_id_idx on career_gaps(user_id);

-- ============================================================
-- APPLICATIONS
-- ============================================================

create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  resume_version_id uuid references resume_versions(id) on delete set null,
  status text not null default 'DISCOVERED' check (status in (
    'DISCOVERED', 'SAVED', 'REVIEWING', 'RESUME_TAILORED', 'RESUME_APPROVED',
    'READY_TO_APPLY', 'APPLIED', 'RECRUITER_CONTACT', 'INTERVIEW', 'OFFER',
    'REJECTED', 'WITHDRAWN'
  )),
  source text,
  application_url text,
  applied_at timestamptz,
  recruiter_name text,
  recruiter_contact text,
  notes text,
  next_action text,
  next_action_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);
alter table applications enable row level security;
create policy "applications_owner_select" on applications for select using (auth.uid() = user_id);
create policy "applications_owner_insert" on applications for insert with check (auth.uid() = user_id);
create policy "applications_owner_update" on applications for update using (auth.uid() = user_id);
create policy "applications_owner_delete" on applications for delete using (auth.uid() = user_id);
create trigger applications_set_updated_at before update on applications for each row execute function set_updated_at();
create index applications_user_id_idx on applications(user_id);
create index applications_job_id_idx on applications(job_id);
create index applications_status_idx on applications(status);

create table application_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references applications(id) on delete cascade,
  event_type text not null,
  from_status text,
  to_status text,
  notes text,
  event_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table application_events enable row level security;
create policy "application_events_owner_select" on application_events for select using (auth.uid() = user_id);
create policy "application_events_owner_insert" on application_events for insert with check (auth.uid() = user_id);
create policy "application_events_owner_update" on application_events for update using (auth.uid() = user_id);
create policy "application_events_owner_delete" on application_events for delete using (auth.uid() = user_id);
create index application_events_user_id_idx on application_events(user_id);
create index application_events_application_id_idx on application_events(application_id);

create table application_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references applications(id) on delete cascade,
  question text not null,
  answer text,
  status text not null default 'draft' check (status in ('draft', 'edited', 'approved', 'rejected')),
  prompt_version text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table application_answers enable row level security;
create policy "application_answers_owner_select" on application_answers for select using (auth.uid() = user_id);
create policy "application_answers_owner_insert" on application_answers for insert with check (auth.uid() = user_id);
create policy "application_answers_owner_update" on application_answers for update using (auth.uid() = user_id);
create policy "application_answers_owner_delete" on application_answers for delete using (auth.uid() = user_id);
create trigger application_answers_set_updated_at before update on application_answers for each row execute function set_updated_at();
create index application_answers_user_id_idx on application_answers(user_id);
create index application_answers_application_id_idx on application_answers(application_id);

create table application_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references applications(id) on delete cascade,
  cover_letter text,
  elevator_pitch text,
  why_this_role text,
  why_this_company text,
  key_talking_points text[],
  potential_weaknesses text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id)
);
alter table application_packages enable row level security;
create policy "application_packages_owner_select" on application_packages for select using (auth.uid() = user_id);
create policy "application_packages_owner_insert" on application_packages for insert with check (auth.uid() = user_id);
create policy "application_packages_owner_update" on application_packages for update using (auth.uid() = user_id);
create policy "application_packages_owner_delete" on application_packages for delete using (auth.uid() = user_id);
create trigger application_packages_set_updated_at before update on application_packages for each row execute function set_updated_at();
create index application_packages_user_id_idx on application_packages(user_id);

create table interview_preparation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references applications(id) on delete cascade,
  likely_questions jsonb,
  technical_questions jsonb,
  leadership_questions jsonb,
  behavioral_questions jsonb,
  company_specific_questions jsonb,
  jd_specific_questions jsonb,
  potential_concerns jsonb,
  recommended_stories jsonb,
  prompt_version text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id)
);
alter table interview_preparation enable row level security;
create policy "interview_preparation_owner_select" on interview_preparation for select using (auth.uid() = user_id);
create policy "interview_preparation_owner_insert" on interview_preparation for insert with check (auth.uid() = user_id);
create policy "interview_preparation_owner_update" on interview_preparation for update using (auth.uid() = user_id);
create policy "interview_preparation_owner_delete" on interview_preparation for delete using (auth.uid() = user_id);
create trigger interview_preparation_set_updated_at before update on interview_preparation for each row execute function set_updated_at();
create index interview_preparation_user_id_idx on interview_preparation(user_id);

-- ============================================================
-- AI AUDIT
-- ============================================================

create table ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  model text not null,
  prompt_version text not null,
  input_reference jsonb,
  output jsonb,
  created_at timestamptz not null default now()
);
alter table ai_generations enable row level security;
create policy "ai_generations_owner_select" on ai_generations for select using (auth.uid() = user_id);
create policy "ai_generations_owner_insert" on ai_generations for insert with check (auth.uid() = user_id);
create index ai_generations_user_id_idx on ai_generations(user_id);
create index ai_generations_type_idx on ai_generations(type);

-- ============================================================
-- LEARNING LOOP
-- ============================================================

create table user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_type text not null,
  subject_id uuid,
  reason text,
  comment text,
  created_at timestamptz not null default now()
);
alter table user_feedback enable row level security;
create policy "user_feedback_owner_select" on user_feedback for select using (auth.uid() = user_id);
create policy "user_feedback_owner_insert" on user_feedback for insert with check (auth.uid() = user_id);
create index user_feedback_user_id_idx on user_feedback(user_id);

create table recommendation_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  job_match_id uuid references job_matches(id) on delete cascade,
  decision text not null check (decision in ('accepted', 'rejected', 'ignored')),
  reason text check (reason in (
    'too_junior', 'too_senior', 'wrong_industry', 'wrong_location', 'salary_too_low',
    'wrong_function', 'not_interested', 'company_concern', 'technical_mismatch',
    'career_direction_mismatch', 'other'
  )),
  comment text,
  preference_updated boolean not null default false,
  created_at timestamptz not null default now()
);
alter table recommendation_feedback enable row level security;
create policy "recommendation_feedback_owner_select" on recommendation_feedback for select using (auth.uid() = user_id);
create policy "recommendation_feedback_owner_insert" on recommendation_feedback for insert with check (auth.uid() = user_id);
create index recommendation_feedback_user_id_idx on recommendation_feedback(user_id);
