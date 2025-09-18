create table public.notifications (
  id serial not null,
  title character varying(255) not null,
  content text not null,
  type character varying(50) null default 'info'::character varying,
  priority character varying(50) null default 'normal'::character varying,
  status character varying(50) null default 'draft'::character varying,
  recipient_emails text[] null default '{}'::text[],
  recipient_employees text[] null default '{}'::text[],
  recipient_departments integer[] null default '{}'::integer[],
  recipient_roles integer[] null default '{}'::integer[],
  send_to_all boolean null default false,
  scheduled_send_at timestamp with time zone null,
  sent_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint notifications_pkey primary key (id),
  constraint notifications_priority_check check (
    (
      (priority)::text = any (
        (
          array[
            'low'::character varying,
            'normal'::character varying,
            'high'::character varying,
            'urgent'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint notifications_status_check check (
    (
      (status)::text = any (
        (
          array[
            'draft'::character varying,
            'published'::character varying,
            'sent'::character varying,
            'cancelled'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint notifications_type_check check (
    (
      (type)::text = any (
        (
          array[
            'info'::character varying,
            'warning'::character varying,
            'error'::character varying,
            'success'::character varying,
            'announcement'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;