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
    }

    async moveObjs(choices) {
        // Get the move menu 

    }

}



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class MoveMenu {

    constructor(dialogData = {}, options = {}) {
        
    }


}