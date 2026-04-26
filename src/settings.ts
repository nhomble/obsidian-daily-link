import { App, PluginSettingTab, Setting } from "obsidian";
import type DailyLinkPlugin from "./main";

export interface DailyLinkSettings {
	propertyName: string;
	allowedExtensions: string[];
	excludedFolders: string[];
	createDailyIfMissing: boolean;
}

export const DEFAULT_SETTINGS: DailyLinkSettings = {
	propertyName: "notes",
	allowedExtensions: ["md"],
	excludedFolders: [],
	createDailyIfMissing: true,
};

export class DailyLinkSettingTab extends PluginSettingTab {
	plugin: DailyLinkPlugin;

	constructor(app: App, plugin: DailyLinkPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Frontmatter property")
			.setDesc(
				"Key in the daily note's frontmatter where new-note links are appended.",
			)
			.addText((text) =>
				text
					.setPlaceholder("notes")
					.setValue(this.plugin.settings.propertyName)
					.onChange(async (value) => {
						this.plugin.settings.propertyName =
							value.trim() || "notes";
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Allowed extensions")
			.setDesc(
				"Comma-separated file extensions to track. Leave the dot off.",
			)
			.addText((text) =>
				text
					.setPlaceholder("md")
					.setValue(this.plugin.settings.allowedExtensions.join(", "))
					.onChange(async (value) => {
						this.plugin.settings.allowedExtensions = value
							.split(",")
							.map((s) => s.trim().replace(/^\./, ""))
							.filter(Boolean);
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Excluded folders")
			.setDesc(
				"Comma-separated folder paths whose new files should be ignored.",
			)
			.addText((text) =>
				text
					.setPlaceholder("templates, archive")
					.setValue(this.plugin.settings.excludedFolders.join(", "))
					.onChange(async (value) => {
						this.plugin.settings.excludedFolders = value
							.split(",")
							.map((s) => s.trim().replace(/^\/+|\/+$/g, ""))
							.filter(Boolean);
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Create daily note if missing")
			.setDesc(
				"When today's daily note doesn't exist yet, create it from your template.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.createDailyIfMissing)
					.onChange(async (value) => {
						this.plugin.settings.createDailyIfMissing = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
