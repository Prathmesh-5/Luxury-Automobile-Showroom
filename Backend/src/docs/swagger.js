import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Luxury Automobile Showroom API",
            version: "1.0.0",
            description: "REST API Documentation for Luxury Automobile Showroom Backend"
        },
        servers: [
            {
                url: "http://localhost:5000"
            }
        ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }
    },
    apis: [
        "./src/routes/*.js"
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;