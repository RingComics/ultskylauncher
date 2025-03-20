import { BindingKey } from "@loopback/core";

export const IsDevelopmentBinding = BindingKey.create<boolean>(
  "bindings.isDevelopment"
);
