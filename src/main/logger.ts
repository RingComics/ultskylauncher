import { BindingKey } from "@loopback/context/dist/binding-key";
import log, { ElectronLog } from "electron-log";
import { uuid } from "@loopback/context/dist/value-promise";

export type Logger = ElectronLog;
export const LoggerBinding = BindingKey.create<Logger>("bindings.logger");

export const newLogInstance = (id = uuid()) => log.create(id);

// Export an instance of the logger that the renderer can use because it doesn't use dependency injection.
export const logger = newLogInstance("renderer");
