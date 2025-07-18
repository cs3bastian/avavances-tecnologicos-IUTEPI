$(document).ready(function() {
  const $chatbotToggle = $('#chatbot-toggle');
  const $chatbotWindow = $('#chatbot-window');
  const $chatbotInput = $('#chatbot-input');
  const $chatbotSend = $('#chatbot-send');
  const $chatbotMessages = $('#chatbot-messages');
  let welcomeShown = false;
  function addChatMessage(message, sender) {
    const msg = $('<div>').addClass('chatbot-message ' + sender)
      .append($('<div>').addClass('chatbot-message-content').html(message));
    $chatbotMessages.append(msg);
    $chatbotMessages.scrollTop($chatbotMessages[0].scrollHeight);
  }
  function isOrderIntent(text) {
    return /pedido|comprar|ordenar|quiero.*(comprar|pedido|ordenar|llevar|adquirir)/i.test(text);
  }
  let orderStep = 0;
  let orderData = {};
  let carrito = [];
  let ubicaciones = [];

  function obtenerPresentacion(producto) {
    const nombre = producto.toLowerCase();
    if (nombre.includes('arepa')) {
      return 'Paquete de 10 unidades (100g c/u)';
    } else if (nombre.includes('empanada') || nombre.includes('tortilla')) {
      return 'Paquete de 500grs';
    } else {
      return '';
    }
  }

  function mostrarResumenPedido() {
    if (carrito.length === 0) return;
    let resumen = `<div class="pedido-resumen"><div class="resumen-titulo"><b>🛒 Resumen de tu pedido:</b></div><ul class="resumen-lista">`;
    carrito.forEach(item => {
      const presentacion = obtenerPresentacion(item.producto);
      resumen += `<li><span class="resumen-prod">${item.producto}</span> <span class="resumen-cant">${item.cantidad}</span>`;
      if (presentacion) {
        resumen += `<br><span class="resumen-presentacion">${presentacion}</span>`;
      }
      resumen += `</li>`;
    });
    resumen += '</ul>';
    if (ubicaciones.length > 0) {
      resumen += '<div class="resumen-titulo"><b>📍 Ubicación:</b></div><ul class="resumen-lista">';
      ubicaciones.forEach(u => {
        resumen += `<li><span class="resumen-ubi" style="font-size:1.08em;font-weight:600;letter-spacing:0.01em;color:#1976d2;text-shadow:0 1px 0 #fff;">${u.estado}${u.ciudad ? ' - ' + u.ciudad : ''}</span></li>`;
      });
      resumen += '</ul>';
    }
    resumen += '</div>';
    addChatMessage(resumen, 'bot');
  }
  const productosYucaFit = [
    'Arepas de Yuca','Arepas de Plátano','Arepas de Batata','Empanadas de Yuca','Arepas de Ocumo','Tortillas de Yuca'
  ];
  // Cantidades en paquetes, mínimo 5, máximo 10, luego campo personalizado
  const cantidadesPaquetes = Array.from({length: 6}, (_, i) => `${i+5} paquete${i+5>1?'s':''}`); // 5 a 10 paquetes
  const estadosVenezuela = [
    'Amazonas','Anzoátegui','Apure','Aragua','Barinas','Bolívar','Carabobo','Cojedes','Delta Amacuro','Distrito Capital','Falcón','Guárico','Lara','Mérida','Miranda','Monagas','Nueva Esparta','Portuguesa','Sucre','Táchira','Trujillo','La Guaira','Yaracuy','Zulia'
  ];
  const ciudadesPorEstado = {
    'Amazonas': ['Puerto Ayacucho'], 'Anzoátegui': ['Barcelona', 'Puerto La Cruz', 'El Tigre', 'Anaco'],
    'Apure': ['San Fernando de Apure', 'Guasdualito'], 'Aragua': ['Maracay', 'La Victoria', 'Turmero', 'Cagua'],
    'Barinas': ['Barinas', 'Socopó'], 'Bolívar': ['Ciudad Bolívar', 'Ciudad Guayana', 'Upata', 'Tumeremo'],
    'Carabobo': ['Valencia', 'Puerto Cabello', 'Guacara', 'Morón'], 'Cojedes': ['San Carlos', 'Tinaquillo'],
    'Delta Amacuro': ['Tucupita'], 'Distrito Capital': ['Caracas'], 'Falcón': ['Coro', 'Punto Fijo'],
    'Guárico': ['San Juan de los Morros', 'Valle de la Pascua', 'Calabozo'], 'Lara': ['Barquisimeto', 'Carora', 'El Tocuyo'],
    'Mérida': ['Mérida', 'El Vigía'], 'Miranda': ['Los Teques', 'Guarenas', 'Guatire', 'Charallave', 'Higuerote'],
    'Monagas': ['Maturín', 'Punta de Mata'], 'Nueva Esparta': ['Porlamar', 'La Asunción', 'Pampatar'],
    'Portuguesa': ['Guanare', 'Acarigua', 'Araure'], 'Sucre': ['Cumaná', 'Carúpano'],
    'Táchira': ['San Cristóbal', 'Rubio', 'La Fría'], 'Trujillo': ['Trujillo', 'Valera', 'Boconó'],
    'La Guaira': ['La Guaira', 'Catia La Mar'], 'Yaracuy': ['San Felipe', 'Yaritagua', 'Chivacoa'],
    'Zulia': ['Maracaibo', 'Cabimas', 'Ciudad Ojeda', 'San Francisco']
  };
  function renderQuickButtons(options, callback, customInputLabel) {
    const $container = $('<div class="quick-buttons"></div>');
    options.forEach(opt => {
      const $btn = $('<button type="button" class="quick-btn"></button>').text(opt);
      $btn.on('click', function() {
        $container.remove();
        callback(opt);
      });
      $container.append($btn);
    });
    if (customInputLabel) {
      const $custom = $('<input type="text" class="quick-custom-input" placeholder="' + customInputLabel + '" />');
      const $ok = $('<button type="button" class="quick-btn">OK</button>');
      $ok.on('click', function() {
        const val = $custom.val().trim();
        if (val) {
          // Validación para el campo de teléfono si el label incluye "teléfono" o "contacto"
          if (/tel[eé]fono|contacto/i.test(customInputLabel)) {
            if (!/^\d+$/.test(val)) {
              alert('El número de teléfono solo debe contener dígitos (sin espacios, guiones ni letras).');
              return;
            }
          }
          $container.remove();
          callback(val);
        }
      });
      $container.append($custom, $ok);
    }
    $chatbotMessages.append($container);
    $chatbotMessages.scrollTop($chatbotMessages[0].scrollHeight);
  }
  $chatbotSend.on('click', function() {
    const userInput = $chatbotInput.val().trim();
    if (!userInput) return;
    addChatMessage(userInput, 'user');
    $chatbotInput.val('');
    if (orderStep === 0 && isOrderIntent(userInput)) {
      orderStep = 1;
      addChatMessage('¡Perfecto! 😊 Para iniciar tu pedido, por favor indícanos tu <b>nombre completo</b>:', 'bot');
      return;
    }
    if (orderStep === 1) {
      orderData.nombre = userInput;
      orderStep = 2;
      addChatMessage('¿Cuál es tu <b>número de contacto</b> (WhatsApp)?', 'bot');
      return;
    }
    if (orderStep === 2) {
      orderData.contacto = userInput;
      orderStep = 3;
      carrito = [];
      addChatMessage('Ahora puedes agregar <b>varios productos</b> a tu pedido. Selecciona un producto y su cantidad. Cuando termines, haz clic en "Finalizar pedido".', 'bot');
      mostrarMenuMultiProducto();
      return;
    }

    // Manejo de menú múltiple de productos
    if (orderStep === 3 && userInput === '__finalizar_pedido__') {
      if (carrito.length === 0) {
        addChatMessage('Debes seleccionar al menos un producto y cantidad.', 'bot');
        mostrarMenuMultiProducto();
        return;
      }
      mostrarResumenPedido();
      orderStep = 4;
      addChatMessage('Ahora selecciona tu <b>ubicación</b>.', 'bot');
      ubicaciones = [];
      mostrarMenuUbicacion();
      return;
    }
  // Menú múltiple de productos y cantidades
  function mostrarMenuMultiProducto() {
    let html = `<div class="menu-multi-producto"><form id="multi-producto-form">
      <table class="multi-table">
        <thead><tr><th>Producto</th><th>Cantidad</th></tr></thead><tbody>`;
    productosYucaFit.forEach((p, idx) => {
      html += `<tr><td><span class="multi-prod-nombre-btn" data-idx="${idx}" data-checked="0">${p}</span></td>`;
      html += `<td><select class="multi-cant-select" data-idx="${idx}" disabled><option value="" selected>Selecciona</option>`;
      cantidadesPaquetes.forEach(c => {
        html += `<option value="${c}">${c}</option>`;
      });
      html += `</select><br><input type="number" min="11" placeholder="Otra cantidad (mín. 11)" class="multi-cant-custom" data-idx="${idx}" style="width:120px;margin-top:6px;" disabled /></td></tr>`;
    });
    html += `</tbody></table>
      <div style="display:flex;justify-content:center;margin-top:18px;">
        <button type="button" id="finalizar-multi-producto" class="multi-finalizar-btn">🛒 <b>Finalizar pedido</b></button>
      </div>
    </form></div>`;
    const $menu = $(html);
    $chatbotMessages.append($menu);
    $chatbotMessages.scrollTop($chatbotMessages[0].scrollHeight);

    // Selección tocando el nombre como botón
    $menu.find('.multi-prod-nombre-btn').on('click', function() {
      const idx = $(this).data('idx');
      const $btn = $(this);
      const $select = $menu.find(`.multi-cant-select[data-idx="${idx}"]`);
      const $custom = $menu.find(`.multi-cant-custom[data-idx="${idx}"]`);
      const checked = $btn.attr('data-checked') === '1';
      if (!checked) {
        $btn.attr('data-checked', '1').addClass('multi-prod-nombre-btn-active');
        $select.prop('disabled', false);
        $custom.prop('disabled', false);
      } else {
        $btn.attr('data-checked', '0').removeClass('multi-prod-nombre-btn-active');
        $select.prop('disabled', true).val('');
        $custom.prop('disabled', true).val('');
      }
      actualizarCarritoTemporal($menu);
    });
    // Validar campo personalizado
    $menu.find('.multi-cant-custom').on('input', function() {
      const val = $(this).val();
      if (val && (!/^[0-9]+$/.test(val) || Number(val) < 11)) {
        $(this)[0].setCustomValidity('El mínimo para otra cantidad es 11 paquetes');
      } else {
        $(this)[0].setCustomValidity('');
      }
      actualizarCarritoTemporal($menu);
    });

    $menu.find('#finalizar-multi-producto').on('click', function() {
      carrito = [];
      $menu.find('.multi-prod-nombre-btn[data-checked="1"]').each(function() {
        const idx = $(this).data('idx');
        const prod = $(this).text();
        let cant = $menu.find(`.multi-cant-select[data-idx="${idx}"]`).val();
        const $custom = $menu.find(`.multi-cant-custom[data-idx="${idx}"]`);
        if ($custom.val()) {
          cant = `${$custom.val()} paquetes`;
        }
        if (cant) {
          carrito.push({ producto: prod, cantidad: cant });
        }
      });
      $menu.remove();
      $chatbotInput.val('__finalizar_pedido__');
      $chatbotSend.click();
    });
  // Estilo para el botón de producto
  $('<style>').text(`
    .multi-prod-nombre-btn {
      display: inline-block;
      background: #e8f5e9;
      color: #222;
      border: 2px solid #b2b2b2;
      border-radius: 10px;
      padding: 7px 18px;
      font-size: 1.08em;
      font-weight: 500;
      cursor: pointer;
      margin: 2px 0;
      transition: background 0.18s, border 0.18s, color 0.18s;
      user-select: none;
    }
    .multi-prod-nombre-btn-active {
      background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
      color: #fff;
      border: 2px solid #43e97b;
      font-weight: 700;
      box-shadow: 0 2px 8px #38f9d733;
    }
  `)
  .appendTo('head');
  }

  // Actualiza el resumen en tiempo real mientras se seleccionan productos
  function actualizarCarritoTemporal($menu) {
    let carritoTemp = [];
    $menu.find('.multi-prod-chk:checked').each(function() {
      const idx = $(this).data('idx');
      const prod = $(this).val();
      const cant = $menu.find(`.multi-cant-select[data-idx="${idx}"]`).val();
      if (cant) {
        carritoTemp.push({ producto: prod, cantidad: cant });
      }
    });
    // Elimina resúmenes previos generados por esta función
    $menu.siblings('.pedido-resumen').remove();
    if (carritoTemp.length > 0) {
      let resumen = `<div class="pedido-resumen"><div class="resumen-titulo"><b>🛒 Resumen de tu pedido:</b></div><ul class="resumen-lista">`;
      carritoTemp.forEach(item => {
        const presentacion = obtenerPresentacion(item.producto);
        resumen += `<li><span class="resumen-prod">${item.producto}</span> <span class="resumen-cant">${item.cantidad}</span>`;
        if (presentacion) {
          resumen += `<br><span class="resumen-presentacion">${presentacion}</span>`;
        }
        resumen += `</li>`;
      });
      resumen += '</ul></div>';
      $menu.before(resumen);
    }
  }
  // Estilos para el menú múltiple
  $('<style>').text(`
    .menu-multi-producto {
      background: #f8f8f8;
      border-radius: 16px;
      box-shadow: 0 4px 18px #0002;
      padding: 24px 22px 18px 22px;
      margin: 18px 0 0 0;
      display: block;
      border: 1.5px solid #e0e0e0;
      max-width: 480px;
      margin-left: auto;
      margin-right: auto;
    }
    .multi-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 6px;
      margin-bottom: 12px;
    }
    .multi-table th, .multi-table td {
      padding: 8px 10px;
      text-align: left;
      background: #fff;
      border-radius: 8px;
      font-size: 1.04em;
    }
    .multi-table th {
      color: #388e3c;
      font-weight: bold;
      border-bottom: 2px solid #b2b2b2;
      background: #e8f5e9;
    }
    .multi-prod-label {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 1.08em;
      font-weight: 500;
      color: #222;
    }
    .multi-prod-chk {
      accent-color: #4caf50;
      margin-right: 6px;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    .multi-prod-nombre {
      letter-spacing: 0.01em;
    }
    .multi-cant-select {
      border: 1.5px solid #b2b2b2;
      border-radius: 7px;
      padding: 7px 12px;
      font-size: 1em;
      background: #f6fff6;
      min-width: 110px;
      transition: border 0.2s;
      cursor: pointer;
    }
    .multi-cant-select:focus {
      border: 1.5px solid #4caf50;
      outline: none;
      background: #e8f5e9;
    }
    .multi-finalizar-btn {
      background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
      color: #fff;
      border: none;
      border-radius: 30px;
      padding: 16px 38px;
      font-size: 1.18em;
      font-weight: bold;
      box-shadow: 0 2px 12px #38f9d733;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
      margin-top: 8px;
      letter-spacing: 0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
      border: 2px solid #4caf50;
    }
    .multi-finalizar-btn:hover {
      background: linear-gradient(90deg, #38f9d7 0%, #43e97b 100%);
      transform: scale(1.04);
      border-color: #388e3c;
    }
  `)
  .appendTo('head');
    // Manejo de menú de ubicaciones
    if (orderStep === 4 && userInput.startsWith('__estado__')) {
      const estado = userInput.replace('__estado__', '');
      orderData.localidad = estado;
      const ciudades = ciudadesPorEstado[estado] || [];
      if (ciudades.length > 0) {
        addChatMessage('Selecciona tu <b>ciudad</b> principal:', 'bot');
        mostrarMenuCiudad(ciudades);
      } else {
        ubicaciones = [{ estado, ciudad: '' }];
        mostrarResumenPedido();
        finalizarPedido();
      }
      return;
    }
    if (orderStep === 4 && userInput.startsWith('__ciudad__')) {
      const ciudad = userInput.replace('__ciudad__', '');
      ubicaciones = [{ estado: orderData.localidad, ciudad }];
      mostrarResumenPedido();
      finalizarPedido();
      return;
    }

  function finalizarPedido() {
    orderStep = 0;
    // Tomar el primer producto y la primera ubicación para compatibilidad backend
    const primerProducto = carrito[0] || { producto: '', cantidad: '' };
    const primeraUbicacion = ubicaciones[0] || { estado: '', ciudad: '' };
    let localidad = primeraUbicacion.estado;
    if (primeraUbicacion.ciudad) {
      localidad += ' - ' + primeraUbicacion.ciudad;
    }
    const pedidoFinal = {
      nombre: orderData.nombre,
      contacto: orderData.contacto,
      producto: primerProducto.producto,
      cantidad: primerProducto.cantidad,
      localidad: localidad
    };
    fetch('/api/notificar-pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoFinal)
    })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        addChatMessage('¡Gracias por tu pedido! 📝<br>Tu solicitud será cotizada y confirmada vía WhatsApp en breve. Si tienes dudas, puedes escribirnos directamente a <a href="https://wa.me/584144029489" target="_blank" style="color:#25d366;font-weight:bold;">+58 4144029489</a>.', 'bot');
      } else {
        addChatMessage(data.error || 'Hubo un error al enviar tu pedido. Intenta de nuevo o contáctanos por WhatsApp.', 'bot');
      }
    })
    .catch(() => {
      addChatMessage('Error de conexión al enviar el pedido.', 'bot');
    });
    carrito = [];
    ubicaciones = [];
    orderData = {};
  }
  // Menú dinámico para productos
  function mostrarMenuProducto() {
    let html = '<div class="menu-producto"><label>Producto:</label><select id="menu-producto-select" class="menu-select"><option value="" disabled selected>Selecciona un producto</option>';
    productosYucaFit.forEach(p => {
      html += `<option value="${p}">${p}</option>`;
    });
    html += '</select></div>';
    const $menu = $(html);
    $chatbotMessages.append($menu);
    $chatbotMessages.scrollTop($chatbotMessages[0].scrollHeight);
    $menu.find('#menu-producto-select').on('change', function() {
      const prod = $(this).val();
      $menu.remove();
      $chatbotInput.val(`__producto__${prod}`);
      $chatbotSend.click();
    });
  }

  function mostrarMenuCantidad() {
    let html = '<div class="menu-cantidad"><label>Cantidad:</label><select id="menu-cantidad-select" class="menu-select"><option value="" disabled selected>Selecciona cantidad</option>';
    cantidadesPaquetes.forEach(c => {
      html += `<option value="${c}">${c}</option>`;
    });
    html += '</select> o <input type="number" min="5" id="menu-cantidad-custom" placeholder="Personalizada (mín. 5)" style="width:120px;" class="menu-input" /></div>';
    const $menu = $(html);
    $chatbotMessages.append($menu);
    $chatbotMessages.scrollTop($chatbotMessages[0].scrollHeight);
    $menu.find('#menu-cantidad-select').on('change', function() {
      const cant = $(this).val();
      $menu.remove();
      $chatbotInput.val(`__cantidad__${cant}`);
      $chatbotSend.click();
    });
    $menu.find('#menu-cantidad-custom').on('keydown', function(e) {
      if (e.key === 'Enter') {
        let cant = $(this).val().trim();
        if (cant && !isNaN(cant) && Number(cant) >= 5) {
          cant = `${cant} paquete${cant>1?'s':''}`;
          $menu.remove();
          $chatbotInput.val(`__cantidad__${cant}`);
          $chatbotSend.click();
        } else {
          alert('El mínimo es 5 paquetes.');
        }
      }
    });
  }

  function mostrarMenuUbicacion() {
    let html = '<div class="menu-ubicacion"><label>Estado:</label><select id="menu-estado-select" class="menu-select"><option value="" disabled selected>Selecciona un estado</option>';
    estadosVenezuela.forEach(e => {
      html += `<option value="${e}">${e}</option>`;
    });
    html += '</select></div>';
    const $menu = $(html);
    $chatbotMessages.append($menu);
    $chatbotMessages.scrollTop($chatbotMessages[0].scrollHeight);
    $menu.find('#menu-estado-select').on('change', function() {
      const estado = $(this).val();
      $menu.remove();
      $chatbotInput.val(`__estado__${estado}`);
      $chatbotSend.click();
    });
  }

  function mostrarMenuCiudad(ciudades) {
    let html = '<div class="menu-ciudad"><label>Ciudad:</label><select id="menu-ciudad-select" class="menu-select"><option value="" disabled selected>Selecciona una ciudad</option>';
    ciudades.forEach(c => {
      html += `<option value="${c}">${c}</option>`;
    });
    html += '</select></div>';
    const $menu = $(html);
    $chatbotMessages.append($menu);
    $chatbotMessages.scrollTop($chatbotMessages[0].scrollHeight);
    $menu.find('#menu-ciudad-select').on('change', function() {
      const ciudad = $(this).val();
      $menu.remove();
      $chatbotInput.val(`__ciudad__${ciudad}`);
      $chatbotSend.click();
    });
  }
    // Si no es pedido, flujo normal
    const $loading = $('<div class="chatbot-message bot loading"><div class="chatbot-message-content">Cargando...</div></div>');
    $chatbotMessages.append($loading);
    $chatbotMessages.scrollTop($chatbotMessages[0].scrollHeight);
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userInput })
    })
    .then(res => res.json())
    .then(data => {
      $loading.remove();
      addChatMessage(data.reply || data.error || 'Error en la respuesta', 'bot');
    })
    .catch(() => {
      $loading.remove();
      addChatMessage('Error de conexión con el servidor.', 'bot');
    });
  });
  $chatbotInput.on('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $chatbotSend.click();
    }
  });
  $chatbotToggle.on('click', function() {
    $chatbotWindow.toggleClass('active');
    if ($chatbotWindow.hasClass('active')) {
      $('.chatbot-tab-invite').hide();
      $chatbotToggle.hide();
      $chatbotInput.focus();
    } else {
      $('.chatbot-tab-invite').show();
      $chatbotToggle.show();
    }
  });
  $('#chatbot-close').on('click', function() {
    $chatbotWindow.removeClass('active');
    $('.chatbot-tab-invite').show();
    $chatbotToggle.show();
  });
  if (!welcomeShown) {
    addChatMessage('¡Hola! 👋 Soy el asistente de YucaFit. Aquí puedes consultar información sobre nuestros productos <b>y también hacer tu pedido directamente por este chat</b>. Solo escribe tu duda o di que quieres comprar y te ayudo paso a paso. 😊', 'bot');
    welcomeShown = true;
  }
  $('<style>').text(`
    .quick-buttons { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 0 0; }
    .quick-btn { background: #4caf50; color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 1em; cursor: pointer; transition: background 0.2s; }
    .quick-btn:hover { background: #388e3c; }
    .quick-custom-input { padding: 7px 10px; border: 1px solid #ccc; border-radius: 6px; margin-right: 6px; font-size: 1em; }

    .menu-producto, .menu-cantidad, .menu-ubicacion, .menu-ciudad {
      background: #f8f8f8;
      border-radius: 10px;
      box-shadow: 0 2px 8px #0001;
      padding: 14px 16px 10px 16px;
      margin: 12px 0 0 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .menu-select, .menu-input {
      border: 1px solid #b2b2b2;
      border-radius: 7px;
      padding: 7px 12px;
      font-size: 1em;
      background: #fff;
      margin-right: 6px;
      min-width: 120px;
      transition: border 0.2s;
    }
    .menu-select:focus, .menu-input:focus {
      border: 1.5px solid #4caf50;
      outline: none;
    }
    .pedido-resumen {
      background: #e8f5e9;
      border-radius: 10px;
      box-shadow: 0 2px 8px #0001;
      padding: 12px 18px 10px 18px;
      margin: 14px 0 0 0;
    }
    .resumen-titulo {
      color: #388e3c;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .resumen-lista {
      list-style: none;
      padding-left: 0;
      margin: 0 0 6px 0;
    }
    .resumen-lista li {
      margin-bottom: 2px;
      padding-left: 0.5em;
      position: relative;
    }
    .resumen-lista li:before {
      content: '•';
      color: #4caf50;
      font-size: 1.2em;
      position: absolute;
      left: 0;
      top: 0;
    }
    .resumen-prod {
      font-weight: 500;
      color: #222;
    }
    .resumen-cant {
      color: #388e3c;
      font-weight: 500;
      margin-left: 6px;
    }
    .resumen-presentacion {
      color: #888;
      font-size: 0.97em;
      margin-left: 2px;
      display: inline-block;
    }
    .resumen-ubi {
      color: #1976d2;
      font-weight: 500;
    }
  `).appendTo('head');
});