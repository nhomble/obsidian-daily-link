import { Notice, Plugin, TFile, moment } from "obsidian";
import {
	appHasDailyNotesPluginLoaded,
	createDailyNote,
	getAllDailyNotes,
	getDailyNote,
} from "obsidian-daily-notes-interface";
import {
	basenameFromPath,
	isExcluded,
	isSameLocalDay,
	isUntitledBasename,
	upsertLink,
} from "./lib";
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
				// New notes start as "Untitled"; wait for rename before linking.
				if (isUntitledBasename(file.basename)) return;
				// Files moved/synced in from outside fire "create" but were
				// authored earlier. Only link notes actually created today.
				if (!isSameLocalDay(file.stat.ctime, Date.now())) return;
				void this.linkToDaily(file).catch((err) => {
					console.error("daily-link: failed to link new note", err);
				});
			}),
		);

		this.registerEvent(
			this.app.vault.on("rename", (file, oldPath) => {
				if (!this.ready) return;
				if (!(file instanceof TFile)) return;
				if (!isUntitledBasename(basenameFromPath(oldPath))) return;
				// Skip Untitled files that were created on a previous day.
				if (!isSameLocalDay(file.stat.ctime, Date.now())) return;
				void this.linkToDaily(file).catch((err) => {
					console.error(
						"daily-link: failed to link renamed note",
						err,
					);
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
			new Notice("Core daily notes plugin is not enabled.");
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
			upsertLink(fm as Record<string, unknown>, key, linkText);
		});
	}
}
