import { Notice, Plugin, TFile, moment } from "obsidian";
import {
	appHasDailyNotesPluginLoaded,
	createDailyNote,
	getAllDailyNotes,
	getDailyNote,
} from "obsidian-daily-notes-interface";
import { isExcluded, upsertLink } from "./lib";
import {
	DEFAULT_SETTINGS,
	DailyLinkSettings,
	DailyLinkSettingTab,
} from "./settings";

export default class DailyLinkPlugin extends Plugin {
	settings!: DailyLinkSettings;
	private ready = false;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new DailyLinkSettingTab(this.app, this));

		this.app.workspace.onLayoutReady(() => {
			this.ready = true;
		});

		this.registerEvent(
			this.app.vault.on("create", (file) => {
				if (!this.ready) return;
				if (!(file instanceof TFile)) return;
				void this.linkToDaily(file).catch((err) => {
					console.error("daily-link: failed to link new note", err);
				});
			}),
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<DailyLinkSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async linkToDaily(file: TFile) {
		if (!this.settings.allowedExtensions.includes(file.extension)) return;
		if (isExcluded(file.path, this.settings.excludedFolders)) return;

		if (!appHasDailyNotesPluginLoaded()) {
			new Notice("Daily Link: core Daily Notes plugin is not enabled.");
			return;
		}

		const today = moment();
		const all = getAllDailyNotes();
		let daily = getDailyNote(today, all);

		if (!daily) {
			if (!this.settings.createDailyIfMissing) return;
			daily = await createDailyNote(today);
		}

		// Don't link the daily note to itself.
		if (daily.path === file.path) return;

		const linkText = `[[${file.basename}]]`;
		const key = this.settings.propertyName;

		await this.app.fileManager.processFrontMatter(daily, (fm) => {
			upsertLink(fm, key, linkText);
		});
	}
}
