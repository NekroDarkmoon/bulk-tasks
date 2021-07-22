// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
import { BulkMenu } from "./modules/bulkMenu.js";
import {moduleTag, moduleName} from "./modules/constants.js";


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                     Main 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Hooks.on('init', async() => {
    
    console.log(`${moduleTag} | Initialized.`);
});


Hooks.on('renderSidebarTab', async(app, html) =>{
    addBulkButton(app, html);
});


Hooks.on('setup', async() => {

    console.log(`${moduleTag} | Setup Complete.`);
});


Hooks.on('ready', async() => {

    console.log(`${moduleTag} | Ready.`);
});



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Add Bulk button 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function addBulkButton(app, html) {
    // console.log(app);

    if((app.options.id == "scenes" || app.options.id == "actors" 
        || app.options.id == "items" || app.options.id == "journal" 
        || app.options.id == "tables")){
        let button = $("<div class='header-actions action-buttons flexrow'><button><i class='fas fa-edit'></i></i> Bulk Tasks</button></div>");
        
        button.click(async () => {
            // Render Menu
            new BulkMenu().render(true);
        });
    

        // Render Button
        $(html).find(".directory-header").append(button);
    }


}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//                                    Imports 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++