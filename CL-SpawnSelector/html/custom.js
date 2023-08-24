$(document).ready(function() {
  let designedLocation = null;
  let currentDesignedLocationElement = null;
  let currentSelectorLocationElement = null;
  let locationCounter = 0;
  let originalColors = {};
  let newColors = {};
  let originalIcon = '';
  let newIcon = '';
  let houseBoxIsOpen = false;

  $('.spawn-selector, .spawn-editor').hide();

  window.addEventListener('message', function(event) {
    const config = event.data.config;
    switch (event.data.action) {
      case "spawnSelector":
        if (event.data.status) {
          setScriptStyle(config.ScriptStyle);

          $('.spawn-selector, .selector-location').show();
          $('.rp-logo').attr('src', config.ServerLogo);

          handleLocationsActions('selector-location')

          if (event.data.isNew) {
            const bigTextElement = document.createElement('div');
            bigTextElement.textContent = 'Use the Houses button to choose your apartment';
            bigTextElement.classList.add('new-house-text');
        
            document.body.appendChild(bigTextElement);
            $('.spawn-selector .defaultmap').addClass('blur-effect');
            $('.selector-location').hide();
          }
        } else {
          $('.spawn-selector').hide();
        }
        break;
      case "spawnEditor":
        setScriptStyle(config.ScriptStyle);

        $('.spawn-editor, .designed-location').show();
        $('.rp-logo').attr('src', config.ServerLogo);

        if (designedLocation !== null) {
          const designedLocationElement = document.querySelector(`.designed-location[data-location-id="${locationCounter}"]`);
          if (designedLocationElement) {
            const iconContainer = designedLocationElement.querySelector('.location-icon');
            const createBoxElement = document.querySelector(`.create-box[data-location-id="${locationCounter}"]`);
            dragElement(designedLocationElement, iconContainer, true);
            createBoxElement.style.display = 'block';
          }
        }
        
        handleLocationsActions('designed-location')
      break;
      case "Refresh":
        if (event.data.type === "editor") {
          refreshLocations(event.data.locations, 'designed-location');
        } else if (event.data.type === "selector") {
          refreshLocations(event.data.locations, 'selector-location');
        }
      break;
    }
  });

  $(document).on('keydown', function(event) {
    if (event.key === 'Escape' && $('.spawn-editor').is(':visible')) {
      $('.new-box').css('visibility', 'hidden');
      $('.spawn-editor, .designed-location, .create-box, .edit-box').hide();
      $.post(`https://${GetParentResourceName()}/nuiFocus`, JSON.stringify({}));
    }
  });

  $('.last-location-btn').click(function() {
    $('.selector-location').hide();
    $.post(`https://${GetParentResourceName()}/spawnPlayer`, JSON.stringify({
      type: 'lastlocation',
    }), function(result) {
      if (result) {
        showNotification("Choose an apartment.", 1500);
      }
    });
  });

  $('.new-btn').click(function() {
    const newBoxVisibility = $('.new-box').css('visibility');

    if (newBoxVisibility === 'visible') {
      $('.new-box').css('visibility', 'hidden');
    } else {
      $('.new-box').css('visibility', 'visible');
    }
  });

  $('.location-input.creator').on('input', function() {
    const locationText = $(this).val().trim();
    if (locationText !== '') {
      $('#locationText').text(locationText);
      $(this).addClass('has-content');
      $('.location-label').text('');
    } else {
      $('#locationText').text('Example');
      $(this).removeClass('has-content');
      $('.location-label').text('Enter location name');
    }
  });

  $('.icon-input.creator').on('input', function() {
    const iconText = $(this).val().trim();
    if (iconText.length > 7 && iconText.startsWith('fas fa-')) {
      $('.location-icon i').not('.designed-location .location-icon i').removeClass().addClass(iconText);
      $(this).addClass('has-content');
      $('.icon-label.creator').text('');
    } else {
      $('.location-icon i').not('.designed-location .location-icon i').removeClass().addClass('fas fa-location-crosshairs');
      $(this).removeClass('has-content');
      if (iconText !== '') {
        $('.icon-label.creator').text('');
      } else {
        $('.icon-label.creator').text('Enter icon name');
      }
    }
  });

  $('.color-circle.colors').on('click', function() {
    const circleId = $(this).attr('id');
    const colorPicker = $(this).siblings('.color-picker.creator');
     
    const exampleLocation = document.getElementById('exampleLocation');
    const computedStyles = window.getComputedStyle(exampleLocation.querySelector('.location-icon'));
  
    const iconColor = computedStyles.color;
    const backgroundColor = computedStyles.backgroundColor;
    
    if (circleId === 'icon-color-circle') {
      const hexColor = rgbToHex(iconColor);
      colorPicker.val(hexColor); 
    } else if (circleId === 'background-color-circle') {
      const hexColor = rgbToHex(backgroundColor);
      colorPicker.val(hexColor);
    }
  
    colorPicker.click();
  });  

  $('.color-picker.creator').on('input', function() {
    const selectedColor = $(this).val();
    if (designedLocation === null) {
      if ($(this).attr('id') === 'background-color-picker') {
        $('.location-box .location-icon').not('.designed-location .location-icon').css('background-color', selectedColor);
      } else if ($(this).attr('id') === 'icon-color-picker') {
        $('.location-box .location-icon i').not('.designed-location .location-icon i').css('color', selectedColor);
      }
    }
  });

  $('.color-circle.makers').on('click', function() {
    const circleId = $(this).attr('id');
  
    if (circleId === 'makers-icon-color-circle') {
      $('.confirm-btn').text('DELETE');
    } else if (circleId === 'makers-background-color-circle') {
      $('.confirm-btn').text('CONFIRM');
    }
  });

  $('.create-box .confirm-btn').click(function() {
    if (designedLocation === null) {
      showNotification("No designed location data found.", 1500);
      return;
    }

    const buttonText = $(this).text().trim();

    if (buttonText === 'CONFIRM') {
      const designedLocationElement = document.querySelector('.designed-location[data-location-id="' + locationCounter + '"]');
      const rect = designedLocationElement.getBoundingClientRect();
      const top = rect.top;
      const left = rect.left;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      designedLocation.screenPosition = {
        top,
        left,
        resolution: {
          width: screenWidth,
          height: screenHeight
        }
      };
      $.post(`https://${GetParentResourceName()}/modifyData`, JSON.stringify({
        type: "addlocation",
        locationData: designedLocation,
      }));
      const iconContainer = designedLocationElement.querySelector('.location-icon');
      if (designedLocationElement) {
        $(designedLocationElement).find('.location-text').toggle();
        dragElement(designedLocationElement, iconContainer, false);
        $(`.create-box[data-location-id="${locationCounter}"]`).hide(); 
        iconContainer.style.cursor = 'pointer';
        designedLocation = null;
        locationCounter = locationCounter + 1;
        handleLocationsActions('designed-location')
      }
    } else if (buttonText === 'DELETE') {
      const designedLocationElement = document.querySelector('.designed-location[data-location-id="' + locationCounter + '"]');
      if (designedLocationElement) {
        designedLocationElement.remove();
        designedLocation = null;
        $(`.create-box[data-location-id="${locationCounter}"]`).hide();
        locationCounter = locationCounter + 1;
      }
    } else if (buttonText === 'CHOOSE A BUTTON') {
      showNotification("No selected button, please select an action.", 3000);
    }    

    $('.confirm-btn').text('CHOOSE A BUTTON');
  });

  $('.new-box .new-loc-btn').click(function() {
    const locationText = $('.location-input').val().trim();
    const iconName = $('.icon-input').val().trim();
    const backgroundColor = $('.location-icon').css('background-color');
    const iconColor = $('.location-icon i').css('color');
  
    if (locationText === '' ) {
      showNotification("Fill all the necessary fields", 1500);
      return;
    }

    if (designedLocation !== null) {
      showNotification("You already have an active location.", 1500);
      return;
    }
      
    designedLocation = {
      locationText,
      iconName,
      backgroundColor,
      iconColor,
    };
  
    $('.new-box').css('visibility', 'hidden');
  
    $('.spawn-editor .defaultmap, .designed-location, .new-box, .edit-box').addClass('blur-effect');
    $('.confirmation-box').toggle();
  });

  $('.confirmation-box .create-btn').click(function() {
    resetForm();
    $('.confirmation-box').toggle();
    $('.spawn-editor .defaultmap, .designed-location, .new-box, .edit-box').removeClass('blur-effect');
  });

  $('.color-picker.editor').on('input', function() {
    const selectedColor = $(this).val();
    if (currentDesignedLocationElement) {
      if ($(this).attr('id') === 'background-color-picker') {
        currentDesignedLocationElement.querySelector('.designed-location .location-icon').style.backgroundColor = selectedColor;
        newColors = { backgroundColor: selectedColor };
      } else if ($(this).attr('id') === 'icon-color-picker') {
        currentDesignedLocationElement.querySelector('.designed-location .location-icon i').style.color = selectedColor;
        newColors = { Color: selectedColor };
      }
    }
  });

  $('.color-picker.editor').on('change', function() {
    if (currentDesignedLocationElement) {
      if ($(this).attr('id') === 'background-color-picker') {
        currentDesignedLocationElement.querySelector('.designed-location .location-icon').style.backgroundColor = originalColors.backgroundColor;
        originalColors.backgroundColor = null;
      } else if ($(this).attr('id') === 'icon-color-picker') {
        currentDesignedLocationElement.querySelector('.designed-location .location-icon i').style.color = originalColors.Color;
        originalColors.Color = null;
      }
    }
  });

  $('.icon-input.editor').on('input', function() {
    const iconText = $(this).val().trim();
    
    if (iconText.length > 7 && iconText.startsWith('fas fa-')) {
      $(this).addClass('has-content');
      $('.icon-label.editor').text('');

      if (originalIcon === '') {
        originalIcon = currentDesignedLocationElement.querySelector('.designed-location .location-icon i').className;
      }
      
      const iconNameWithoutPrefix = iconText.replace('fas fa-', '');
      currentDesignedLocationElement.querySelector('.designed-location .location-icon i').className = 'fas fa-' + iconNameWithoutPrefix;
      
      newIcon = 'fas fa-' + iconNameWithoutPrefix;
      
      $('.actions-btn').text('CONFIRM');
    } else {
      $(this).removeClass('has-content');
      
      if (iconText !== '') {
        $('.icon-label.editor').text('');
      } else {
        $('.icon-label.editor').text('Enter icon name');
        $('.actions-btn').text('CHOOSE A BUTTON');
        
        if (originalIcon !== '') {
          currentDesignedLocationElement.querySelector('.designed-location .location-icon i').className = originalIcon;
          originalIcon = '';
        }
        
        newIcon = '';
      }
    }
  });
  
  $('.icon-input.editor').on('change', function() {
    if (originalIcon !== '') {
      currentDesignedLocationElement.querySelector('.designed-location .location-icon i').className = originalIcon;
    }
  });

  $('.color-circle.editors').on('click', function() {
    const circleId = $(this).attr('id');
  
    if (circleId === 'editors-delete-circle') {
      $('.actions-btn').text('DELETE');
    } else if (circleId === 'editors-background-circle') {
      originalColors = { backgroundColor: currentDesignedLocationElement.querySelector('.designed-location .location-icon').style.backgroundColor }
      const colorPicker = $(this).siblings('.color-picker.editor');
      if (originalColors.backgroundColor !== {}) {
        const hexColor = rgbToHex(originalColors.backgroundColor);
        colorPicker.val(hexColor); 
      }
      colorPicker.click();
      $('.actions-btn').text('CONFIRM BG COLOR');
    } else if (circleId === 'editors-icon-color-circle') {
      originalColors = { Color: currentDesignedLocationElement.querySelector('.designed-location .location-icon i').style.color }
      const colorPicker = $(this).siblings('.color-picker.editor');
      if (originalColors.Color !== {}) {
        const hexColor = rgbToHex(originalColors.Color);
        colorPicker.val(hexColor);        
      }
      colorPicker.click();
      $('.actions-btn').text('CONFIRM ICON COLOR');
    }
  });

  $('.edit-box .actions-btn').click(function() {
    const buttonText = $(this).text().trim();
    const designedLocationRect = currentDesignedLocationElement.querySelector('.location-icon').getBoundingClientRect();

    if (buttonText === 'DELETE') {
      if (currentDesignedLocationElement) {
        currentDesignedLocationElement.remove();
        $('.edit-box').toggle();
        $.post(`https://${GetParentResourceName()}/modifyData`, JSON.stringify({
          type: "removelocation",
          left: designedLocationRect.left,
          top: designedLocationRect.top,
        }));
        currentDesignedLocationElement = null;
      }  
    } else if (buttonText === 'CONFIRM BG COLOR') {
      if (newColors !== {}) {
        currentDesignedLocationElement.querySelector('.designed-location .location-icon').style.backgroundColor = newColors.backgroundColor;

        $.post(`https://${GetParentResourceName()}/modifyData`, JSON.stringify({
          type: "modifycolors",
          colors: newColors,
          left: designedLocationRect.left,
          top: designedLocationRect.top,
        }));

        newColors.backgroundColor = null;
      }
    } else if (buttonText === 'CONFIRM ICON COLOR') {
      if (newColors !== {}) {
        currentDesignedLocationElement.querySelector('.designed-location .location-icon i').style.color = newColors.Color;

        $.post(`https://${GetParentResourceName()}/modifyData`, JSON.stringify({
          type: "modifycolors",
          colors: newColors,
          left: designedLocationRect.left,
          top: designedLocationRect.top,
        }));

        newColors.Color = null;
      }  
    } else if (buttonText === 'CONFIRM') {
      if (newIcon !== '') {
        currentDesignedLocationElement.querySelector('.designed-location .location-icon i').className = newIcon;

        if (originalIcon !== '') {
          originalIcon = currentDesignedLocationElement.querySelector('.designed-location .location-icon i').className;
        }

        const iconInput = $('.icon-input.editor');
        iconInput.removeClass('has-content').val('');
        iconInput.siblings('.label.editor').text('Enter icon name');

        $.post(`https://${GetParentResourceName()}/modifyData`, JSON.stringify({
          type: "modifyicon",
          icon: newIcon,
          left: designedLocationRect.left,
          top: designedLocationRect.top,
        }));

        newIcon = ''
      }
    } else if (buttonText === 'CHOOSE A BUTTON') {
      showNotification("No selected button, please select an action.", 1500);
    }    
  
    $(this).text('CHOOSE A BUTTON');
  });

  $('.houses-locations-btn').click(function() {
    houseBoxIsOpen = !houseBoxIsOpen;

    $.post(`https://${GetParentResourceName()}/getHouses`, JSON.stringify({}), 
    function(result) {
      if (result.isNew) {
        if (houseBoxIsOpen) {
          openHousesBox(result.apartments, false, result.config);
        } else {
          closeHousesBox();
        }
      } else {
        if (houseBoxIsOpen) {
          openHousesBox(result.houses, true, result.config);
        } else {
          closeHousesBox();
        }
      }
    });
  });

  function refreshLocations(locations, element) {
    $('.'+element).remove();

    for (const location of locations) {
      const { iconColor, screenPosition, locationText, backgroundColor, iconName } = location;
      const designedLocationElement = createDesignedLocation(locationText, iconName, backgroundColor, iconColor, false, element);

      designedLocationElement.setAttribute('data-location-id', locationCounter++);
  
      positionDesignedLocation(designedLocationElement, screenPosition);

      const iconContainer = designedLocationElement.querySelector('.location-icon');
      iconContainer.style.cursor = 'pointer';

      const locationtext = $(designedLocationElement).find('.location-text');
      locationtext.toggle();

      designedLocationElement.style.display = 'none';
    }
  }

  function positionDesignedLocation(element, screenPosition) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const { left, top, resolution } = screenPosition;
    const { width: originalWidth, height: originalHeight } = resolution;

    const widthRatio = screenWidth / originalWidth;
    const heightRatio = screenHeight / originalHeight;

    const desiredLeft = left * widthRatio;
    const desiredTop = top * heightRatio;
    
    element.style.left = `${desiredLeft}px`;
    element.style.top = `${desiredTop}px`;
  }

  function closeHousesBox() {
    const houseBoxElement = document.querySelector('.house-box');
    $(houseBoxElement).hide();
  }

  function openHousesBox(locations, isHouse, config) {
    const housesBtnElement = document.querySelector('.houses-locations-btn');
    const housesBtnRect = housesBtnElement.getBoundingClientRect();
    
    const boxTop = housesBtnRect.bottom + 10;
    const boxLeft = housesBtnRect.left;

    const houseBoxElement = document.querySelector('.house-box');
    $('.house-box').hide();
    
    houseBoxElement.style.top = boxTop + 'px';
    houseBoxElement.style.left = boxLeft + 'px';

    $(houseBoxElement).show();

    houseBoxElement.innerHTML = '';

    const housesTextElement = document.createElement('p');
    housesTextElement.textContent = "Houses & Apartments";
    housesTextElement.classList.add('label');

    const divider = document.createElement('div');
    divider.classList.add('divider');

    const spawnButton = document.createElement('div');
    spawnButton.textContent = 'SELECT A HOUSE';
    spawnButton.classList.add('create-icon-btn', 'house-btn');

    spawnButton.addEventListener('click', function() {
      const buttonText = $(this).text().trim();
  
      if (buttonText === 'SELECT A HOUSE') {
        showNotification("No selected house, please select a house.", 1500);
      } else {
        $('.spawn-selector .defaultmap').removeClass('blur-effect');
        const bigTextElement = document.querySelector('.new-house-text');
        if (bigTextElement) {
          bigTextElement.remove();
        }

        $('.house-box').hide();
        houseBoxIsOpen = false;
        
        if (!isHouse) {
          $.post(`https://${GetParentResourceName()}/spawnPlayer`, JSON.stringify({
            type: 'apartments',
            label: buttonText,
          }));
        } else {
          $.post(`https://${GetParentResourceName()}/spawnPlayer`, JSON.stringify({
            type: 'house',
            label: buttonText,
            houses: locations,
          }));
        }
      } 
    
      $(this).text('SELECT A HOUSE');
    });

    houseBoxElement.appendChild(housesTextElement);
    houseBoxElement.appendChild(divider);

    if (isHouse) {
      if (locations.length === 0) {
        const noHouses = document.createElement('p');
        noHouses.textContent = "You have no homes.";
        noHouses.classList.add('no-houses');

        houseBoxElement.appendChild(noHouses);
      }
    }

    for (const location of locations) {
      const locationData = config.Houses.LocationInfo;

      const houseLocation = createDesignedLocation(location.label, locationData.IconName, locationData.Colors.BackgroundColor, locationData.Colors.IconColor, false, 'house-location');
      houseLocation.setAttribute('data-location-id', locationCounter++);
      houseLocation.classList.add('house');

      houseLocation.addEventListener('click', function() {
        $('.house-btn').text(location.label);
      });

      houseBoxElement.appendChild(houseLocation);
    }

    houseBoxElement.appendChild(spawnButton);
  }

  function setScriptStyle(style) {
    $(':root').removeClass('dark natural').addClass(style);
  }

  function createDesignedLocation(locationText, iconName, backgroundColor, iconColor, draggable, element) {
    const designedLocationElement = document.createElement('div');
    designedLocationElement.classList.add(element);
    designedLocationElement.setAttribute('data-location-id', locationCounter);
    
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('location-icon');
    iconContainer.style.backgroundColor = backgroundColor;
    designedLocationElement.iconContainer = iconContainer;
  
    const icon = document.createElement('i');
    const iconNameWithoutPrefix = iconName.replace('fas ', '');
    if (iconName.startsWith('fas fa-')) {
      icon.classList.add('fas', iconNameWithoutPrefix);
    } else {
      icon.classList.add('fas', 'fa-location-crosshairs');
    }
    icon.style.color = iconColor;
    iconContainer.appendChild(icon);
  
    const locationTextElement = document.createElement('div');
    locationTextElement.classList.add('location-text');
    locationTextElement.textContent = locationText;
  
    designedLocationElement.appendChild(iconContainer);
    designedLocationElement.appendChild(locationTextElement);
  
    document.body.appendChild(designedLocationElement);
  
    dragElement(designedLocationElement, iconContainer, draggable);

    return designedLocationElement
  }

  function rgbToHex(rgbColor) {
    const rgbValues = rgbColor.match(/\d+/g);
    return `#${Number(rgbValues[0]).toString(16).padStart(2, '0')}${Number(rgbValues[1]).toString(16).padStart(2, '0')}${Number(rgbValues[2]).toString(16).padStart(2, '0')}`;
  }

  function clickEditorHandler() {
    const locationIconElement = this.querySelector('.location-icon'); 
    const designedLocationRect = locationIconElement.getBoundingClientRect();
    const editBoxElement = document.querySelector('.edit-box');
    
    if (currentDesignedLocationElement === this) {
      $(editBoxElement).hide();
      currentDesignedLocationElement = null;
    } else {
      $('.edit-box').hide();
      $('.actions-btn').text('CHOOSE A BUTTON'); 
      
      editBoxElement.style.top = designedLocationRect.top + 'px';
      editBoxElement.style.left = (designedLocationRect.right + 10) + 'px';
  
      $(editBoxElement).show();
      currentDesignedLocationElement = this;
    }
  }

  function clickSelectorHandler() {
    const locationID = parseInt(this.getAttribute('data-location-id'));
    const locationTextElement = document.querySelector('.selector-location[data-location-id="' + locationID + '"] .location-text');
    const locationText = locationTextElement.textContent;
  
    const locationIconElement = this.querySelector('.location-icon'); 
    const designedLocationRect = locationIconElement.getBoundingClientRect();
  
    $.post(`https://${GetParentResourceName()}/getLocationData`, JSON.stringify({
      locationName: locationText
    }), function(result) {
      if (result) {
        const spawnBoxElement = document.querySelector('.spawn-box');
  
        if (currentSelectorLocationElement === this) {
          $(spawnBoxElement).hide();
          currentSelectorLocationElement = null;
        } else {
          $('.spawn-box').hide();
          
          spawnBoxElement.style.top = designedLocationRect.top + 'px';
          spawnBoxElement.style.left = (designedLocationRect.right + 10) + 'px';
  
          $(spawnBoxElement).show();
          currentSelectorLocationElement = this;

          spawnBoxElement.innerHTML = '';

          const imageElement = document.createElement('img');
          imageElement.src = result.ImageURL;
          imageElement.classList.add('image'); 
  
          const locationTextElement = document.createElement('p');
          locationTextElement.textContent = locationText;
          locationTextElement.classList.add('label');

          const streetTextElement = document.createElement('p');
          streetTextElement.textContent = result.Street;
          streetTextElement.classList.add('street');

          const locationIconClone = locationIconElement.querySelector('i').cloneNode(true);
          locationIconClone.classList.add('icon');
          locationTextElement.appendChild(locationIconClone);

          const divider = document.createElement('div');
          divider.classList.add('divider');

          const peopleContainer = document.createElement('div');
          peopleContainer.classList.add('people-container');

          const peopleIcon = document.createElement('i');
          peopleIcon.classList.add('fas', 'fa-user', 'people-icon');

          const peopleCount = document.createElement('span');
          peopleCount.textContent = result.People;
          peopleCount.classList.add('people-text');

          const peopleText = document.createElement('span');
          peopleText.textContent = 'People';
          peopleText.classList.add('people-text');

          const underPeopleDivider = document.createElement('div');
          underPeopleDivider.classList.add('divider', 'under-people');

          const createButton = document.createElement('div');
          createButton.textContent = 'SELECT SPAWN';
          createButton.classList.add('create-icon-btn', 'spawn-btn');

          createButton.addEventListener('click', function() {
            $('.selector-location, .spawn-box').hide();
            $.post(`https://${GetParentResourceName()}/spawnPlayer`, JSON.stringify({
              type: 'maplocation',
              coords: result.Coordinates,
            }));
          });

          peopleContainer.appendChild(peopleIcon);
          peopleContainer.appendChild(peopleCount);
          peopleContainer.appendChild(peopleText);
  
          spawnBoxElement.appendChild(imageElement);
          spawnBoxElement.appendChild(locationTextElement);
          spawnBoxElement.appendChild(streetTextElement);
          spawnBoxElement.appendChild(divider);
          spawnBoxElement.appendChild(peopleContainer);
          spawnBoxElement.appendChild(underPeopleDivider);
          spawnBoxElement.appendChild(createButton);
        }
      }
    });
  }
  
  function hoverHandler(event) {
    const locationID = parseInt(event.target.getAttribute('data-location-id'));
    const locationType = event.target.classList.contains('designed-location') ? 'designed-location' : 'selector-location';
    const designedLocationElement = document.querySelector('.' + locationType + '[data-location-id="' + locationID + '"]');
    const locationText = $(designedLocationElement).find('.location-text');
  
    locationText.toggle();
  
    designedLocationElement.style.zIndex = 999;
  }
  
  function handleLocationsActions(location) {
    document.querySelectorAll('.' + location).forEach(function(element) {
      element.removeEventListener('click', clickEditorHandler);
      element.removeEventListener('click', clickSelectorHandler);
      element.removeEventListener('mouseenter', hoverHandler);
      element.removeEventListener('mouseleave', hoverHandler);
  
      if (location === 'designed-location') {
        element.addEventListener('click', clickEditorHandler);
      } else if (location === 'selector-location') {
        element.addEventListener('click', clickSelectorHandler);
      }
  
      element.addEventListener('mouseenter', hoverHandler);
      element.addEventListener('mouseleave', hoverHandler);
    });
  }

  function resetForm() {
    const locationInput = $('.location-input');
    locationInput.removeClass('has-content').val('');
    locationInput.siblings('.label').text('Enter location name');
  
    const iconInput = $('.icon-input');
    iconInput.removeClass('has-content').val('');
    iconInput.siblings('.label').text('Enter icon name');
  
    $('#locationText').text('Example');
  
    const exampleLocation = document.getElementById('exampleLocation');
    const iconElement = exampleLocation.querySelector('.location-box .location-icon i');
    
    iconElement.className = 'fas fa-location-crosshairs';
    
    const locationIconElement = exampleLocation.querySelector('.location-box .location-icon');
    locationIconElement.style.backgroundColor = '#E76FF1';
    iconElement.style.color = 'var(--secondary-color)';
    
    if (designedLocation !== null) {
      const { locationText, iconName, backgroundColor, iconColor } = designedLocation;
      showNotification(locationText + " successfully created, drag it to the desired location.", 2000);
      createDesignedLocation(locationText, iconName, backgroundColor, iconColor, true, 'designed-location');
    }
  }

  function showNotification(messege, time) {
    const notificationContainer = document.getElementById('notificationContainer');
    const notificationContent = document.getElementById('notificationContent');
        
    notificationContent.textContent = messege;
  
    notificationContainer.style.transform = 'translateY(0)';
  
    setTimeout(() => {
      hideNotification();
    }, time);
  }
    
  function hideNotification() {
    const notificationContainer = document.getElementById('notificationContainer');
    notificationContainer.style.transform = 'translateY(100%)';
  }

  function dragElement(elmnt, header, draggable) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var isDragging = false;

    const designedLocationElement = document.querySelector(`.designed-location[data-location-id="${locationCounter}"]`);
    const createBoxElement = document.querySelector('.create-box');
  
    if (draggable) {
      header.onmousedown = dragMouseDown;
      header.onmouseup = releaseDragElement;
    } else {
      header.onmousedown = null;
      header.onmouseup = null;
    }
  
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
      isDragging = true;
    }
  
    function elementDrag(e) {
      if (isDragging) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
  
        elmnt.style.top = elmnt.offsetTop - pos2 + "px";
        elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  
        createBoxElement.style.display = 'none';
      }
    }
  
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
      isDragging = false;
  
      showCreateBox();
    }
  
    function releaseDragElement() {
      if (!isDragging) {
        showCreateBox();
      }
    }
  
    function showCreateBox() {
      const idCreateBox = designedLocationElement.querySelector(`.create-box[data-location-id="${locationCounter}"]`);
      const designedLocationRect = designedLocationElement.getBoundingClientRect();
  
      if (!idCreateBox) {
        createBoxElement.style.top = designedLocationRect.top + 'px';
        createBoxElement.style.left = (designedLocationRect.right + 10) + 'px';
    
        createBoxElement.style.display = 'block';
        createBoxElement.setAttribute('data-location-id', locationCounter);
      } else {
        idCreateBox.style.top = designedLocationRect.top + 'px';
        idCreateBox.style.left = (designedLocationRect.right + 10) + 'px';
    
        idCreateBox.style.display = 'block';
        idCreateBox.setAttribute('data-location-id', locationCounter);
      }
    }
  }
});