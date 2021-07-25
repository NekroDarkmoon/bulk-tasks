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

        // Get list of scenes, actors, items, journals and rolltables.
        this.actors = game.actors._source;
        this.scenes = game.scenes._source;
        this.items = game.items._source;
        this.journals = game.journal._source;
        this.tables = game.tables._source;
        this.playlists = game.playlists._source;
        this.macros = game.macros._source;
    }


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
        const data = {
            actors: this.actors,
            journals: this.journals,
            items: this.items,
            macros: this.macros,
            scenes: this.scenes,
            tables: this.tables,
            playlists: this.playlists,
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


    async _updateObject(event, formData){
 
    }


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