import { onRequestPost as __api_set_admin_ts_onRequestPost } from "/home/user/flow-app/functions/api/set-admin.ts"
import { onRequestGet as __api_settings_ts_onRequestGet } from "/home/user/flow-app/functions/api/settings.ts"
import { onRequestPut as __api_settings_ts_onRequestPut } from "/home/user/flow-app/functions/api/settings.ts"

export const routes = [
    {
      routePath: "/api/set-admin",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_set_admin_ts_onRequestPost],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_settings_ts_onRequestGet],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_settings_ts_onRequestPut],
    },
  ]