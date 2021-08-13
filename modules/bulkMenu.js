// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from "./constants.js";

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                   Bulk Menu 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class BulkMenu extends Application{
    constructor(dialogData={}, options={}){
        super(dialogData, options);
        this.data = dialogData;
        this.userID = game.user.id;

    }

    /**
     * 
     */
    static get defaultOptions(){
        return mergeObject(super.defaultOptions, {
            title: "Bulk Tasks",
            id: "bulk-tasks-menu",
            template: `modules/${moduleName}/templates/bulkMenu.html`,
            width: 580,
            height: 'auto',
            resizable: true,
            closeOnSubmit: false,
            tabs: [{navSelector: ".tabs", contentSelector: "form", inital: "actors"}] 
        });
    }


    getData(options = {}){

        // Get directories
        const documentTypes = {
            actors: game.actors.directory,
            journals:game.journal.directory,
            items:game.items.directory,
            macros: game.macros.directory.documents,
            scenes:game.scenes.directory,
            tables:game.tables.directory,
            playlists:game.playlists.directory, 
        }

        console.log(documentTypes);

        for (let documentType in documentTypes) {
            if (documentType !== "macros") {
                const folders = documentTypes[documentType].folders;
                console.log(folders);
                for (let folder of folders) {
                    const temp = this.permissionFilterer(folder.content);
                    folder.content = temp;
                }

                // Add root folder
                const root = {
                    data: {name: "Root"}
                };

                // Populate root folder
                const entities = documentTypes[documentType].documents;
                let noParent = entities.filter(entity => entity.data.folder === null);
                noParent = this.permissionFilterer(noParent);
                
                console.log(noParent);

                root.content = noParent;
                folders.push(root);
            }        
        }


        console.log(documentTypes);


        const data = {
            actors: documentTypes.actors.folders,
            journals: documentTypes.journals.folders,
            items: documentTypes.items.folders,
            macros: documentTypes.macros.folders,
            scenes: documentTypes.scenes.folders,
            tables: documentTypes.tables.folders,
            playlists: documentTypes.playlists.folders,
        };

        return data;
    }


    activateListeners(html){
        super.activateListeners(html);

        let choices = new Set();

        // Add on checked
        html.find('.bm-check').on('change', async (event) =>{
            
            const selected = event.currentTarget.dataset;
            const checked = event.currentTarget.checked;

            if (checked) {
                choices.add(selected);
            } else {
                choices.delete(selected);
            }
        });
        

        html.on('click', '#bm-delete', async(event) =>{
            // Initiate are you sure?
            Dialog.confirm({
                title: "Delete Entities",
                content: "Are you sure? </br> This action is permanent and cannot be undone.",
                yes: () => {this.deleteObjs(choices)},
                no: () => {this.close()},
                defaultYes: false
            });
        });


        html.on('click', '#bm-move', async(event) => {
            const moveMenu = new MoveMenu({}, {}, choices).render(true);
            this.close();
        });


        html.on('click', '#bm-cancel', async(event) => {
            this.close();
        });

    }


    async _updateObject(event, formData){}


    async deleteObjs(choices) {
        // Get checked items
        console.log(choices);

        // Fetch and delete each item in the set
        for (let item of choices) {
            await game[item.type].get(item.id).delete();
            console.log(`${moduleTag} | Deleted ${item.name}`);
        }
        
        this.render(true);
    }

    
    permissionFilterer(inputArray) {
        return inputArray.filter(entity => (entity.data.permission.default == 3 
            || entity.data.permission[this.userID] == 3));
    }

}



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class MoveMenu extends Application{

    constructor(dialogData = {}, options = {}, selected = {}) {
        super(dialogData, options);
        
        this.data = dialogData;
        this.choices = selected;
        this.entityTypes = null;
        this.mostType = null;

        // Get list of folders and types.
        this.folders = game.folders._source;

    }


    static get defaultOptions(){
        return mergeObject(super.defaultOptions, {
            title: "Move Entities",
            id: "bulk-tasks-move",
            template: `modules/${moduleName}/templates/bulkMove.html`,
            width: 500,
            height: 'auto',
            resizable: true,
            closeOnSubmit: false
        });
    }


    getData(options = {}){

        let entityTypes = {actors:[], journal:[], items:[], scenes:[], tables:[], playlists:[], macros:[]};
        let defFolderTypes = {Actor:[], JournalEntry:[], Item:[], Scene:[], RollTable:[], Playlist:[], macros:[]};

        for (let item of this.choices) {
            entityTypes[item.type].push(item);
        }
        this.entityTypes = entityTypes;

        for (let folder of this.folders) {
            defFolderTypes[folder.type].push(folder);
        }

        const mostType = Object.keys(entityTypes).reduce((a, b) => entityTypes[a].length > entityTypes[b].length ? a : b);
        this.mostType = mostType;

        const folderTypes = {
            actors: defFolderTypes.Actor,
            journal: defFolderTypes.JournalEntry,
            items: defFolderTypes.Item,
            scenes: defFolderTypes.Scene,
            tables: defFolderTypes.RollTable,
            playlists: defFolderTypes.Playlist,
        }

        const data = {
            choices: entityTypes[mostType],
            folders: folderTypes[mostType]
        };

        return data;
    }


    activateListeners(html) {
        super.activateListeners(html);
        

        html.on('click', '#bmove-move', async (event) => {
            let destFolder = $('.bm-destination-select').find(':selected')[0].dataset;

            for (let item of this.entityTypes[this.mostType]) {
                await (game[item.type].get(item.id)).update({folder: destFolder.id});
                console.log(`${moduleTag} | Moving ${item.name} to ${destFolder.name}`);
            }

            this.close();

        });
        

        html.on('click', '#bmove-cancel', async (event) => {
            this.close();
        });

    }


    async _updateObject(event, formData) {

    }


}