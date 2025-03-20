import { dialog } from "electron";
import { BindingScope, inject, injectable } from "@loopback/context";
import { Logger, LoggerBinding } from "@/main/logger";

@injectable({
  scope: BindingScope.SINGLETON,
})
export class ErrorService {
  constructor(@inject(LoggerBinding) private logger: Logger) {}

  async handleError(title: string, message: string) {
    this.logger.error(`${title}: ${message}`);
    this.logger.error(new Error().stack);
    await dialog.showErrorBox(title, message);
  }

  async handleUnknownError(error?: unknown) {
    this.logger.error(
      `Unknown error. The stack trace might hold more details. ${error}`
    );
    this.logger.error(new Error().stack);
    await dialog.showErrorBox(
      "An unknown error has occurred",
      "If you require more support, please post a message in the official modpack Discord and send your launcher log files."
    );
  }
}
