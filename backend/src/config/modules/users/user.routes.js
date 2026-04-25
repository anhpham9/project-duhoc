router.get(
    "/users",
    authenticate,
    authorize({ permissions: ["user.read"] }),
    controller.getUsers
);

router.post(
    "/users",
    authenticate,
    authorize({ permissions: ["user.create"] }),
    controller.createUser
);