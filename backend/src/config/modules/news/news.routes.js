router.post(
    "/news/publish",
    authenticate,
    authorize({ permissions: ["news.publish"] }),
    controller.publishNews
);