# Bulk Tasks

[![License: MIT](https://img.shields.io/badge/Software_License-MIT-blue.svg)](https://mit-license.org/)

![Supported Foundry Versions](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://github.com/NekroDarkmoon/bulk-tasks/releases/latest/download/system.json&color=blue)
![Latest Release Download Count](https://img.shields.io/github/downloads/NekroDarkmoon/bulk-tasks/latest/module.zip)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fa5e&colorB=brightgreen)](https://forge-vtt.com/bazaar#package=bulk-tasks)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?logo=patreon&logoColor=white)](https://www.patreon.com/ForgemasterModules)

Bulk tasks provides an interface to delete, duplicate, export, import, move, and rename foundry documents en masse.

### Selection

The interface provides multiple ways to select documents.

- Clicking on either the document name or the checkbox will select it.
  - Clicking on folder names or the associated checkbox selected the folder and everything in it.
- Clicking a checkbox and then holding shift while selecting another checkbox selects all the documents in between those two documents.
- The "select all" button selects all documents of the given type.
- The "de-select all" button deselects all documents of the given type.

### Delete Documents

Allows for the deletion of documents across multiple document types including folders. Depending on the number of documents being deleted this may take a while. Keep a lookout for the job completed notification to pop up.

![](/imgs/delete_demo.gif)

### Duplicate Documents

Allows for the duplication of multiple documents. The following options are available while duplicating documents.
- **Naming Convention:** Pragmatically generate names for the duplicated documents.
- **Number of Copies:** Select how many duplicates of each document to make.
- **Duplicate to root:** Duplicate documents to main directory outside of any folders.
- **Reset Images:** Reset the document's image to it's foundry provided default.

### Export Documents

Allows for the export of documents across multiple document types. The exported documents are compressed and zipped into a zip file ready to download. The following options are available while exporting documents.
- **Zip Name:** The name of the zip file that is generated.
- **File Naming Convention:** Pragmatically generate names for the exported documents.
- **Preserve Folder Structure:** Preserve the foundry folder structure when exporting to a zip file.
- **Preserve Metadata:** Preserve foundry metadata in the exported documents.


![](/imgs/export_demo.gif)

### Import Documents

Allows for the import of documents across multiple document types. Depending on the number of documents this may take a while. Keep a lookout for the job completion notification to pop up.

![](/imgs/import_demo.gif)

### Move Documents

Allows for the relocation of documents. Documents can be moved from root to folders, from folders to folders, and from folders to root.


![](/imgs/move_demo.gif)

### Rename Documents

Allows for the renaming of multiple documents. The following options are available while duplicating documents.
- **Naming Convention:** Pragmatically generate names for the duplicated documents.

### Installation Guide

Paste the following link in the install module section of foundry. https://github.com/NekroDarkmoon/bulk-tasks/releases/latest/download/module.json

### Support

Consider buying me a coffee if you like my work. [https://ko-fi.com/nekrodarkmoon](https://ko-fi.com/nekrodarkmoon)
