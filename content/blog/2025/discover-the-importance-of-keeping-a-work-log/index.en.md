---
title: 'Discover the Importance of Keeping a Work Log'
date: 2025-02-04T17:07:47-06:00
image: 'images/cover.png'
tags: [productivity]
draft: false
description: 'Find out how keeping a work log can help you stay organized, boost your productivity, and stand out on your team.'
slug: 'discover-the-importance-of-keeping-a-work-log'
---

I started keeping a work log as a developer at Banco G&T Continental, and when I started working as a contractor it became a daily habit. It sounds like one more thing to do, but it has paid off more than once:

1. During a company restructure, when I was asked for a detailed report of my achievements, the obstacles I faced, and how I got past them.
2. When I asked for a raise, I had all the data ready to make my case.
3. On a time and materials contract, the client asked for a detailed breakdown of daily activities in the timesheet, and my log let me deliver it quickly and accurately.

Every time, the alternative would have been digging through my memory to figure out what I did weeks ago.

## What goes in it

Nothing fancy. Through the day I write down:

- What I finished
- What's next
- What got in the way or ate my time
- Notes, things I learned, and anything that was hard

It looks a bit like stand-up questions, but it's for you, not the team. I usually write my goals at the start of the day, progress and surprises (those last-minute requests) during it, and a short summary at the end.

Over time that gives you a few things. You have a record of your wins for reviews, so you're not relying on memory. You see where the hours actually went, interruptions included, and when you work best. The morning entry answers "where do I start?", and at the end of the day you can see what's done and move the rest to tomorrow without carrying it in your head. I'd rather look things up in my notes than try to remember them.

Use whatever is quick to update and easy to search: a paper notebook, Notion, anything. I use Obsidian every day, so that's my setup below.

## My Obsidian setup

`Obsidian` is a free, private writing app, and you can use it for anything, including commercial work. My template is a simplified version of the one **Dann Berg** shares in {{< extlink href="https://dannb.org/blog/2022/obsidian-daily-note-template/" >}}My Obsidian Daily Note Template{{< /extlink >}}, adapted for work logs.

### Create a vault

Install `Obsidian` and create a vault for your work log.

{{< gallery caption="Obsidian - Obsidian - Create a Vault" >}}
{{< gallery-image src="images/obsidian.webp" alt="Welcome screen on Obsidian showing different options, highlighting the option to create a new vault." >}}
{{< gallery-image src="images/obsidian-create-vault.webp" alt="Options inside 'Create a new vault' in Obsidian, where you set the vault name and location." >}}
{{< /gallery >}}

### Install the plugins

You need two plugins:

- {{< extlink href="https://help.obsidian.md/Plugins/Daily+notes" >}}Daily Notes{{< /extlink >}}, included by default in Obsidian, no installation required.
- {{< extlink href="https://github.com/liamcain/obsidian-calendar-plugin" >}}Calendar{{< /extlink >}}, a community plugin that needs to be installed from the {{< extlink href="https://help.obsidian.md/Extending+Obsidian/Community+plugins" >}}Obsidian plugin gallery{{< /extlink >}}

First enable community plugins:

{{< gallery caption="Obsidian - Enable Community Plugins" >}}
{{< gallery-image src="images/obsidian-enable-community-plugins.webp" alt="Settings screen in Obsidian's community plugins section, with the button to enable community plugins." >}}
{{< gallery-image src="images/obsidian-community-plugins-enabled.webp" alt="Option to enable community plugins in Obsidian, showing active status." >}}
{{< /gallery >}}

Then click `Browse` and search for the plugin by name (the screenshot shows `Templater`, but it works the same for any plugin):

{{< gallery caption="Obsidian - Search Community Plugins" >}}
{{< gallery-image src="images/obsidian-community-plugins-browse.webp" alt="Searching for plugins in the community plugins window in Obsidian, showing the search for 'Templater." >}}
{{< /gallery >}}

Install and enable Calendar:

{{< gallery caption="Obsidian - Install and Enable Calendar Plugin" >}}
{{< gallery-image src="images/obsidian-community-plugins-install-calendar.webp" alt="Search result for 'Calendar' plugin in Obsidian, showing the install button." >}}
{{< gallery-image src="images/obsidian-community-plugins-calendar-enable.webp" alt="'Calendar' plugin installed and showing the enable button." >}}
{{< gallery-image src="images/obsidian-community-plugins-calendar-enabled.webp" alt="'Calendar' plugin in Obsidian already installed and enabled." >}}
{{< /gallery >}}

### Create the template

Create a `templates` folder at the root of the vault, and inside it a note called `daily-notes-template`. Paste this in source mode (`Ctrl+Shift+v` pastes as plain text):

```markdown
---
created: '{{date:YYYY-MM-DD-dddd}}'
tags:
    - daily
---

## 🗓️ Daily Questions

### 📌 Tasks

- [ ]

### 🎥 Meetings

-

### 🚧 Impediments

-

## 📝 Notes
```

Then create a `daily` folder at the root of the vault.

{{< gallery caption="Obsidian - Directory Structure" >}}
{{< gallery-image src="images/obsidian-folder-structure.webp" alt="Obsidian's main screen showing folder structure to set up daily notes template and generation folder." >}}
{{< gallery-image src="images/obsidian-template-content.webp" alt="Content of the daily notes template in Obsidian." >}}
{{< /gallery >}}

### Configure Daily Notes

In settings, under **Core plugins**, open **Daily Notes** and set:

- **Date Format**: `YYYY/MM-MMMM/YYYY-MM-DD-dddd`, which nests your notes by _year > month > day_
- **New File Location**: `daily`
- **Template file location**: `templates/daily-notes-template`

I also turn on **Open daily note on startup**.

{{< gallery caption="Obsidian - Daily Note Settings" >}}
{{< gallery-image src="images/obsidian-create-daily-note-configuration.webp" alt="Daily Notes plugin settings in Obsidian, showing settings for file date format, location, and the option to create the daily note on launch." >}}
{{< /gallery >}}

### Use it

Click `Open today's daily note` in the left sidebar to create today's entry, or open it if it already exists. If you turned on the startup option, Obsidian does it for you when it opens.

{{< gallery caption="Obsidian - Create Today's Note" >}}
{{< gallery-image src="images/obsidian-open-todays-daily-note.webp" alt="Obsidian app screen, showing where to click for your daily note." >}}
{{< gallery-image src="images/obsidian-todays-daily-note.webp" alt="A daily note created in Obsidian using the configured template." >}}
{{< /gallery >}}

The **Expand** button in the top right shows the **Calendar** tab, where you can jump between days. Double-click a date without a note and it offers to create one. When it's open, the button changes to **Collapse**.

{{< gallery caption="Obsidian - Calendar View" >}}
{{< gallery-image src="images/obsidian-expand.webp" alt="Obsidian app, showing where to click to expand views, like the calendar view." >}}
{{< gallery-image src="images/obsidian-expand-calendar.webp" alt="Obsidian app, showing the Calendar view." >}}
{{< /gallery >}}

I switch to editing mode when I need to review something from that view. Search is usually enough to find old entries, but once you have a few weeks of notes, take a look at the `Graph view`.

---

Photo by {{< extlink href="https://unsplash.com/@dsebas?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Pedro Costa{{< /extlink >}} on {{< extlink href="https://unsplash.com/photos/black-and-white-computer-keyboard-aXY5doQNZTc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
