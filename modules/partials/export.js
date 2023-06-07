export function onExport(data) {
	const zip = new JSZip();

	const documents = [...data].map(doc => game[doc.type].get(doc.id));

	// Create a file for each document
	documents.forEach(d => {
		// Create Json Object
		const data = d.toCompendium(null);
		data.flags['exportSource'] = {
			world: game.world.id,
			system: game.system.id,
			coreVersion: game.version,
			systemVersion: game.system.version,
		};

		// Add file to zip
		zip.file(
			`${d.name.slugify().replace(/([:\/])/, '_')}.json`,
			JSON.stringify(data, null, 2)
		);
	});

	// Download Zip
	console.log('Generating Zip');
	zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then(blob => {
		// Create an element to trigger the download
		let a = document.createElement('a');
		a.href = window.URL.createObjectURL(blob);
		a.download = 'bulk-tasks-export.zip';

		// Dispatch a click event to the element
		a.dispatchEvent(
			new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				view: window,
			})
		);
		setTimeout(() => window.URL.revokeObjectURL(a.href), 100);
	});
}
