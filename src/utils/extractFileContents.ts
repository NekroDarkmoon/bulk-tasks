export async function extractFileContents(file: File) {
	const content = await file.text();
	const documents: any[] = [];

	if (file.name.split('.').pop() === 'json') {
		try {
			const data = JSON.parse(content);

			if (data.package) documents.push(...data.items);
			else documents.push(data);
		} catch (err) {
			console.warn(`Failed to parse datable due to bad entry: ${file.name}`);
			console.error(err);
			return null;
		}
	} else {
		const entries = content.split(/\r?\n/).filter(Boolean);
		entries.forEach((entry) => {
			try {
				const data = JSON.parse(entry);
				documents.push(data);
			} catch (error) {
				console.warn(`Failed to parse database due to bad entry.: ${file.name}`);
				console.error(error);
				return null;
			}
		});
	}

	return documents;
}
