const component = function () {
    const element = document.createElement('button');
    element.className = 'btn btn-info offset-lg-2 col-lg-3';
    element.innerHTML = 'Hello world';
    return element;
};

export {
    component,
};
