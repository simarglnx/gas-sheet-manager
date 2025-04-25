export * from "@core/SheetManager";

const RepositoryEntity = {
    selector: "_db",
    ranges: { headers: "1, 1, 1, lc" },
    columns: {
        id: "Номер",
        user: "Пользователь",
        email: "Email",
        phone: "Телефон",
        dateCreate: "Дата создания",
        datePayment: "Дата оплаты",
        title: "Title",
        status: "Статус",
        sum: "Стоимость, RUB",
        paid: "Оплачено",
    },
};

// @ts-ignore
function upgradeDataBase(data) {
    if (!data && data.length < 1) return undefined;
    const dataSource = SheetManager.dataSource({ entities: [RepositoryEntity] });
    const repository = dataSource.getRepository(RepositoryEntity.selector);
    // @ts-ignore
    const filter = data.map((entity) => {
        const email = entity.email,
            title = entity.title,
            dateCreate = entity.dateCreate;

        return { email, title, dateCreate };
    });
    repository.findAndDelete({ $or: filter });
    repository.sort("dateCreate");
    repository.insertMany(data);
}
