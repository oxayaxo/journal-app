-- プロフィールテーブル
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '名無しさん',
  created_at timestamptz default now()
);

-- ジャーナルエントリーテーブル
create table public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  mood text not null,
  praises text[] default '{}',
  gratitudes text[] default '{}',
  wishes text[] default '{}',
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;

-- プロフィール（誰でも読める、自分だけ書ける）
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- エントリー（自分のデータだけ読み書きできる）
create policy "entries_select" on public.journal_entries for select using (auth.uid() = user_id);
create policy "entries_insert" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "entries_update" on public.journal_entries for update using (auth.uid() = user_id);

-- コミュニティ用: user_idと日付だけ公開するビュー（内容は見えない）
create view public.entry_dates with (security_invoker = false) as
  select user_id, date
  from public.journal_entries;

-- ユーザー登録時にプロフィールを自動作成するトリガー
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', '名無しさん'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
