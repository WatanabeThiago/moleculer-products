"use strict";

const DbService = require("../mixins/db.mixin");

module.exports = {
	name: "products",
	mixins: [
		DbService("products"),
	],

	/**
	 * Default settings
	 */
	settings: {
		rest: "products/",

		fields: ["_id", "barCode", "price"],

		// Validation schema for new entities
		entityValidator: {
			barCode: { type: "string", min: 3 },
			price: { type: "number", min: 1 },
		}
	},

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Create a new article.
		 * Auth is required!
		 *
		 * @actions
		 * @param {Object} asasasdas - Article entity
		 *
		 * @returns {Object} Created entity
		 */
		create: {
			rest: "POST /",
			params: {
				product: { type: "object" }
			},
			async handler(ctx) {
				let entity = ctx.params.product;
				console.log("antes");
				await this.validateEntity(entity);
				console.log("passou");

				entity.createdAt = new Date();
				entity.updatedAt = new Date();

				const doc = await this.adapter.insert(entity);
				console.log({ doc });

				// entity = 	await this.entityChanged("created", entity, ctx);
				return { product:entity };
			}
		},

		/**
		 * List articles with pagination.
		 *
		 * @actions
		 * @param {String} tag - Filter for 'tag'
		 * @param {String} author - Filter for author ID
		 * @param {String} favorited - Filter for favorited author
		 * @param {Number} limit - Pagination limit
		 * @param {Number} offset - Pagination offset
		 *
		 * @returns {Object} List of articles
		 */
		list: {
			cache: {
				keys: ["barCode"]
			},
			rest: "GET /",

			async handler(ctx) {
				const limit = ctx.params.limit ? Number(ctx.params.limit) : 20;
				const offset = ctx.params.offset ? Number(ctx.params.offset) : 0;

				let params = {
					limit,
					offset,
					sort: ["-createdAt"],
					query: {}
				};
				let countParams;


				countParams = Object.assign({}, params);
				// Remove pagination params
				if (countParams && countParams.limit)
					countParams.limit = null;
				if (countParams && countParams.offset)
					countParams.offset = null;

				const res = await this.Promise.all([
					// Get rows
					this.adapter.find(params),

					// Get count of all rows
					this.adapter.count(countParams)

				]);

				return res;
			}
		},

		/**
		 * Get an article by slug
		 *
		 * @actions
		 * @param {String} id - Article slug
		 *
		 * @returns {Object} Article entity
		 */


	},

	/**
	 * Methods
	 */
	methods: {
		/**
		 * Find an article by slug
		 *
		 * @param {String} slug - Article slug
		 *
		 * @results {Object} Promise<Article
		 */
		findBySlug(slug) {
			return this.adapter.findOne({ slug });
		},

		/**
		 * Transform the result entities to follow the RealWorld API spec
		 *
		 * @param {Context} ctx
		 * @param {Array} entities
		 * @param {Object} product - Logged in product
		 */
		async transformResult(ctx, entities, product) {
			console.table({ ctx, entities, product });
			if (Array.isArray(entities)) {
				const products = await this.Promise.all(entities.map(item => this.transformEntity(ctx, item, product)));
				return products;

			} else {
				const product = await this.transformEntity(ctx, entities, product);
				return product;
			}
		},

		/**
		 * Transform a result entity to follow the RealWorld API spec
		 *
		 * @param {Context} ctx
		 * @param {Object} entity
		 * @param {Object} product - Logged in product
		 */
		async transformEntity(ctx, entity, product) {
			if (!entity) return null;

			return entity;
		}
	}
};
