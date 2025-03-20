import { controller, handle } from "@/main/decorators/controller.decorator";
import {
  IsModpackValidResponse,
  MODPACK_EVENTS,
} from "@/main/controllers/modpack/mopack.events";
import { inject, service } from "@loopback/core";
import { ModpackService } from "@/main/services/modpack.service";
import { LauncherService } from "@/main/services/launcher.service";
import { Logger, LoggerBinding } from "@/main/logger";

@controller
export class ModpackController {
  constructor(
    @service(ModpackService) private modpackService: ModpackService,
    @service(LauncherService) private launcherService: LauncherService,
    @inject(LoggerBinding) private logger: Logger
  ) {}

  @handle(MODPACK_EVENTS.IS_MODPACK_SET)
  isModpackSet() {
    return this.modpackService.isModpackSet();
  }

  @handle(MODPACK_EVENTS.IS_MODPACK_DIRECTORY_VALID)
  isValidModDirectory(filepath: string): IsModpackValidResponse {
    if (!filepath) {
      this.logger.warn("No filepath specified when checking mod directory");
      return { ok: false };
    }
    return this.modpackService.checkModpackPathIsValid(filepath);
  }

  @handle(MODPACK_EVENTS.SET_MODPACK)
  setModpack(filepath: string) {
    if (!filepath) {
      this.logger.error("No filepath specified when setting mod directory");
    }
    return this.launcherService.setModpack(filepath);
  }

  @handle(MODPACK_EVENTS.GET_MODPACK)
  getModpack() {
    return this.modpackService.getModpackDirectory();
  }

  @handle(MODPACK_EVENTS.GET_MODPACK_METADATA)
  getModpackMetadata() {
    return this.modpackService.getModpackMetadata();
  }

  @handle(MODPACK_EVENTS.DELETE_MODPACK_DIRECTORY)
  deleteModpackDirectory() {
    return this.modpackService.deleteModpackDirectory();
  }
}
