// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { moduleName, moduleTag } from "./constants.js";

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export class BulkMenu extends FormApplication{

    constructor(dialogData={}, options={}){
        super(dialogData, options);
        this.data = dialogData;

        // Get list of scenes, actors, items, journals and rolltables.
        this.actors = game.actors._source;
        this.scenes = game.scenes._source;
        this.items = game.items._source;
        this.journals = game.journal._source;
        this.tables = game.tables._source;
    }


    static get defaultOptions(){
        return mergeObject(super.defaultOptions, {
            title: "Bulk Tasks",
            id: "bulk-tasks-menu",
            template: `modules/${moduleName}/templates/bulkMenu.html`,
            width: 550,
            height: 'auto',
            resizable: true,
            closeOnSubmit: false,
            tabs: [{navSelector: ".tabs", contentSelector: "div", inital: "actors"}] 
        });
    }


    getData(options = {}){
        const data = {
            actors: this.actors,
            journals: {},
            items: {},
            scenes: {},
            tables: {}
        };

        return data;
    }


    activateListeners(html){
        super.activateListeners(html);

        html.on('click', '#bm-delete', async(event) =>{
            // Initiate are you sure?
            this.submit();
        });

        html.on('click', '#bm-cancel', async(event) => {
            this.close();
        });

    }


    async _updateObject(event, formData){
        console.log(formData);
        console.log(event);

        if (event?.explicitOriginalTarget.id == "bm-delete"){
            Dialog.confirm({
                title: "Delete Entities",
                content: "Are you sure? </br> This action is permanent and cannot be undone.",
                yes: () => {this.deleteObjs(event, formData)},
                no: () => {this.close()},
                defaultYes: false
            });
        }


    }


    async deleteObjs(event, formData) {
        // Get checked items
        let choices = new Set();
                
        for (const [key, value] of Object.entries(formData)) {
            if (value === true) {choices.add(key);}
        }

        // Fetch and delete each item in the set
        for (let item of choices) {
            console.log(`${moduleTag} | Deleted ${game.actors.get(item).data.name}`);
            // await game.actors.delete(item);
        }
    }


}
