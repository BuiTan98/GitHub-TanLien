
// Đối tượng 'Validator'
function Validator(options) {
    var selectorRules = {};

    // Hàm thực hiện validate
    function validate(inputElement, rule) {

        // value người dùng nhập vào: inputElement.value
        // var errorMessage = rule.test(inputElement.value);  /*test function bên dưới: rule.test*/ (đã bị thay)
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        
        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];
        var errorMessage;

        // Lặp qua từng rules & kiểm tra
        // Nếu có lỗi thì rừng việc kiểm tra
        for (var i = 0; i < rules.length; i++) {
            errorMessage = rules[i] (inputElement.value);  // (Nơi đã thay)
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid')
        } else {
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid')
        }

        return !errorMessage;
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);

    if (formElement) {

        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault(); // bỏ đi hành vi mặc định (hiện lỗi trang)
            
            var isFormValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // Trường hợp submit với javascript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        return (values[input.name]  = input.value) && values;   
                    }, {});
                    options.onSubmit (formValues);
                } 
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }

        }
        
        
        
        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ...)
        options.rules.forEach(function (rule) {

            // Lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }


            var inputElement = formElement.querySelector(rule.selector);
           
            if (inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);  
                }

                // xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid')
                }
            }
        });
        // console.log(selectorRules)

    }

}



// Định nghĩa các rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => Trả ra messae lỗi
// 2. Khi hợp lệ => Không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, message) {
    return { 
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined :  message || 'Vui lòng nhập trường này'
        }
    };
}

Validator.isEmail = function (selector, message) {
    return { 
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined :  message || 'Trường này phải là email'
        }
    };
}

Validator.minLength = function (selector, min, message) {
    return { 
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined :  message || `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    };
}

Validator.isConfirmed = function (selector, getCofirmValue, message) {
    return { 
        selector: selector,
        test: function (value) {
            return value === getCofirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    };
}