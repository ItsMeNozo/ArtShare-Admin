import type { Core } from '@strapi/strapi';

// Lazy import node‑fetch (ESM‑only) → tránh require lỗi trong v5
const fetch = (...args: Parameters<typeof import('node-fetch').default>) =>
  import('node-fetch').then(({ default: f }) => f(...args));

const NEST_API = process.env.NEST_API ?? 'http://localhost:4000';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /** GET /users list → dùng cho Content‑Manager table */
  async find(ctx: any) {
    const qs = ctx.request.querystring ?? '';
    const r = await fetch(`${NEST_API}/users?${qs}`, {
      headers: {
        Authorization: ctx.request.header.authorization,
      },
    });
    const data = await r.json();

    // Map về định dạng CM: { results, pagination }
    ctx.body = {
      results: data.items ?? data,
      pagination: data.pagination ?? {},
    };
  },

  /** DELETE single user */
  async deleteOne(ctx: any) {
    const { id } = ctx.params;
    const r = await fetch(`${NEST_API}/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: ctx.request.header.authorization,
      },
    });
    ctx.body = await r.json();
  },
});
