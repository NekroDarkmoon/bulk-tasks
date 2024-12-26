export async function replaceAsync(str: string, rgx: RegExp, fn: (...args: any[]) => any) {
	const replacements = await Promise.all(Array.from(str.matchAll(rgx), (match) => fn(match)));
	let i = 0;

	return str.replace(rgx, () => replacements[i++]);
}
