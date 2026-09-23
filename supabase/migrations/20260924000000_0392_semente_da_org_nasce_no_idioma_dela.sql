-- Semente da organização nova nasce no idioma dela (organizations.locale).
-- Só linhas NOVAS: nada existente é reescrito; pt-BR e es seguem byte a byte iguais.

create or replace function public.fn_seed_default_pipeline_for_org() returns trigger
    language plpgsql
    set search_path to 'public', 'pg_temp'
    as $$
declare
  v_pipeline_id uuid;
  v_position numeric := 1000;
  v_en boolean := lower(coalesce(new.locale, '')) like 'en%';
  r record;
begin
  insert into public.crm_pipelines (organization_id, name, slug, is_default, position)
  values (new.id, case when v_en then 'Orders' else 'Pedidos' end, 'pedidos', true, 1000)
  returning id into v_pipeline_id;

  for r in
    select t.stage_slug, t.won, t.lost,
           case when v_en then t.stage_name_en else t.stage_name end as stage_name
    from (values
      ('Carrinho abandonado',  'Abandoned cart',       'carrinho_abandonado',  false, false),
      ('Aguardando pagamento', 'Awaiting payment',     'aguardando_pagamento', false, false),
      ('Pago',                 'Paid',                 'pago',                 true,  false),
      ('Em separação',        'Packing',              'em_separacao',         false, false),
      ('Enviado',              'Shipped',              'enviado',              false, false),
      ('Entregue',             'Delivered',            'entregue',             false, false),
      ('Pós-venda',           'After-sales',          'pos_venda',            false, false),
      ('Cancelado',            'Canceled',             'cancelado',            false, true)
    ) as t(stage_name, stage_name_en, stage_slug, won, lost)
  loop
    insert into public.crm_stages (organization_id, pipeline_id, name, slug, position, is_won, is_lost)
    values (new.id, v_pipeline_id, r.stage_name, r.stage_slug, v_position, r.won, r.lost);
    v_position := v_position + 1000;
  end loop;

  return new;
end$$;

revoke execute on function public.fn_seed_default_pipeline_for_org() from public, anon, authenticated;

create or replace function public.fn_semear_tipos_de_agendamento(p_organization_id uuid)
returns integer
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_criados integer := 0;
  v_en boolean;
  r record;
begin
  select lower(coalesce(o.locale, '')) like 'en%' into v_en
    from public.organizations o where o.id = p_organization_id;
  v_en := coalesce(v_en, false);

  for r in
    select t.slug, t.categoria, t.duracao, t.posicao,
           case when v_en then t.nome_en else t.nome end as nome
    from (values
      ('Consulta',    'Consultation', 'consulta',    'consulta', 30, 1000::numeric),
      ('Reunião',     'Meeting',      'reuniao',     'reuniao',  30, 2000::numeric),
      ('Atendimento', 'Appointment',  'atendimento', 'outro',    30, 3000::numeric)
    ) as t(nome, nome_en, slug, categoria, duracao, posicao)
  loop
    insert into public.calendar_event_types
      (organization_id, name, slug, category, duration_minutes, position)
    values
      (p_organization_id, r.nome, r.slug, r.categoria, r.duracao, r.posicao)
    on conflict (organization_id, slug) do nothing;

    if found then
      v_criados := v_criados + 1;
    end if;
  end loop;

  return v_criados;
end;
$$;
