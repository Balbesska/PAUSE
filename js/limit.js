if (userRole === 'admin') {
    document.getElementById('icon_vk').style.display = 'block'; // Показать элемент для администратора
} else {
    document.getElementById('icon_vk').style.display = 'none'; // Скрыть элемент для других пользователей
}