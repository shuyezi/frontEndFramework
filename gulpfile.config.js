module.exports = {
	port: 7777,
	src: {
		libsJs: ["dev/libs/js/*.js"],
		libsLess: ["dev/libs/less/*.less"],
		libsImg: ["dev/libs/images/**/*.@(png|gif|GIF|jpg|jpge|svg)"],
		pagesJs: ["dev/pages/**/*.js"],
		pagesLess: ["dev/pages/**/*.less"],
		pagesHtml: ["dev/pages/**/*.html"],
		pagesImg: [ "dev/pages/**/*.@(png|gif|GIF|jpg|jpge|svg)" ]
	},
	dest: {
		dev: {
			libs: "release_debug/libs/",
			pages: "release_debug/pages/"
		},
		production: {
			libs: "release/libs/",
			pages: "release/pages/"
		}
	}
}