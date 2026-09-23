import { execFileSync } from "node:child_process";

import { describe, expect, it } from "vitest";

const container = process.env.TEST_DB_CONTAINER;
if (!container) throw new Error("TEST_DB_CONTAINER not set — rode via `pnpm test:db`");
const containerName: string = container;

function sql(script: string): string {
  return execFileSync(
    "docker",
    ["exec", "-i", containerName, "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-tA", "-f", "-"],
    { input: script, encoding: "utf8" },
  ).trim();
}

function novaOrg(id: string, locale: string): void {
  sql(`insert into public.organizations (id, slug, legal_name, display_name, locale)
       values ('${id}', 'sem-${locale}', 'Sem', 'Sem', '${locale}');`);
}

function funil(id: string): string {
  return sql(`select p.name || '|' || string_agg(s.name, ',' order by s.position)
                from public.crm_pipelines p join public.crm_stages s on s.pipeline_id = p.id
               where p.organization_id = '${id}' group by p.name;`);
}

function tipos(id: string): string {
  return sql(`select string_agg(name, ',' order by position) from public.calendar_event_types
               where organization_id = '${id}';`);
}

const PT = "Pedidos|Carrinho abandonado,Aguardando pagamento,Pago,Em separação,Enviado,Entregue,Pós-venda,Cancelado";

describe("a semente da organização nova nasce no idioma dela", () => {
  it("en: funil e tipos de agendamento em inglês, slugs intactos", () => {
    const id = "5eed0000-0000-4000-8000-0000000000e1";
    novaOrg(id, "en");
    expect(funil(id)).toBe(
      "Orders|Abandoned cart,Awaiting payment,Paid,Packing,Shipped,Delivered,After-sales,Canceled",
    );
    expect(tipos(id)).toBe("Consultation,Meeting,Appointment");
    expect(sql(`select slug from public.crm_pipelines where organization_id = '${id}'`)).toBe("pedidos");
  });

  it("pt-BR e es: byte a byte o que sempre foi", () => {
    novaOrg("5eed0000-0000-4000-8000-0000000000e2", "pt-BR");
    novaOrg("5eed0000-0000-4000-8000-0000000000e3", "es");
    for (const id of ["5eed0000-0000-4000-8000-0000000000e2", "5eed0000-0000-4000-8000-0000000000e3"]) {
      expect(funil(id)).toBe(PT);
      expect(tipos(id)).toBe("Consulta,Reunião,Atendimento");
    }
  });

  it("organização existente não é reescrita ao mudar o idioma", () => {
    const id = "5eed0000-0000-4000-8000-0000000000e2";
    sql(`update public.organizations set locale = 'en' where id = '${id}'`);
    expect(funil(id)).toBe(PT);
  });
});
