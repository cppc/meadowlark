suite('Global Tests', function() {
	test('page has a valid title', function() {
		console.log("test");
		assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO');
	});
});