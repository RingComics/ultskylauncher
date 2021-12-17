export const enum IPCEvents {
  CHECK_FOR_UPDATE = "check-for-update",
  UPDATE_AVAILABLE = "update-available",
  UPDATE_NOT_AVAILABLE = "update-not-available",
  UPDATE_DOWNLOADED = "update-downloaded",
  UPDATE_APP = "update-app",
  DOWNLOAD_PROGRESS = "download-progress",

  CLOSE = "close",
  MINIMIZE = "MINIMIZE",

  MODPACK_SELECTED = "MODPACK_SELECTED",
  LAUNCH_MO2 = "LAUNCH_MO2",
  LAUNCH_GAME = "LAUNCH_GAME",
  CLOSE_GAME = "CLOSE_GAME",

  SHOW_OPEN_DIALOG = "SHOW_OPEN_DIALOG",
  ERROR = "ERROR",
  MESSAGE = "MESSAGE",
  CONFIRMATION = "CONFIRMATION",

  GET_PRESETS = "GET_PRESETS",
  CHECK_MOD_DIRECTORY = "CHECK_MOD_DIRECTORY",

  GET_ENB_PRESETS = "GET_ENB_PRESETS",
  COPY_ENB_FILES = "COPY_ENB_FILES",
  RESTORE_ENB_PRESETS = "RESTORE_ENB_PRESETS",
  DELETE_ALL_ENB_FILES = "DELETE_ALL_ENB_FILES",
  GET_RESOLUTIONS = "GET_RESOLUTIONS",

  CHECK_IF_FILE_EXISTS = "CHECK_IF_FILE_EXISTS",
}
