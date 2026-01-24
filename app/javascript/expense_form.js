document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('expense-form');
  if (!form) return;

  let itemIndex = document.querySelectorAll('.expense-item-card').length;

  // Get all users from the first select element
  function getAllUsersHTML() {
    const firstSelect = document.querySelector('.user-select');
    if (!firstSelect) return '';
    return Array.from(firstSelect.options)
      .map(opt => `<option value="${opt.value}">${opt.text}</option>`)
      .join('');
  }

  // Add item button
  const addItemBtn = document.getElementById('add-item');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', function() {
      const itemsContainer = document.getElementById('expense-items');
      const newItem = createItemHTML(itemIndex);
      itemsContainer.insertAdjacentHTML('beforeend', newItem);
      itemIndex++;
      attachItemListeners();
    });
  }

  // Add participant to specific item
  form.addEventListener('click', function(e) {
    if (e.target.closest('.add-participant-to-item')) {
      const button = e.target.closest('.add-participant-to-item');
      const itemIndex = button.getAttribute('data-item-index');
      const itemCard = button.closest('.expense-item-card');
      const participantsList = itemCard.querySelector('.participants-list');
      
      // Count existing participants in this item
      const existingParticipants = participantsList.querySelectorAll('.participant-row').length;
      const newParticipant = createParticipantHTML(itemIndex, existingParticipants);
      participantsList.insertAdjacentHTML('beforeend', newParticipant);
    }
  });

  // Remove item
  form.addEventListener('click', function(e) {
    if (e.target.closest('.remove-item')) {
      if (confirm('Are you sure you want to remove this item?')) {
        e.target.closest('.expense-item-card').remove();
        // Renumber items
        renumberItems();
      }
    }
    
    if (e.target.closest('.remove-participant')) {
      const participantRow = e.target.closest('.participant-row');
      const participantsList = participantRow.closest('.participants-list');
      if (participantsList.querySelectorAll('.participant-row').length > 1) {
        participantRow.remove();
        // Renumber participants in this item
        const itemCard = participantRow.closest('.expense-item-card');
        renumberParticipantsInItem(itemCard);
      } else {
        alert('At least one participant is required per item.');
      }
    }
  });

  function createItemHTML(index) {
    const allUsers = getAllUsersHTML();
    
    return `
      <div class="expense-item-card mb-4 p-3 border rounded shadow-sm" data-item-index="${index}">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0 text-primary">
            <i class="bi bi-receipt me-2"></i>Item ${index + 1}
          </h6>
          <button class="btn btn-sm btn-outline-danger remove-item" type="button">
            <i class="bi bi-trash me-1"></i>Remove Item
          </button>
        </div>
        <div class="mb-3">
          <label class="form-label">Item Description</label>
          <input type="text" name="expense[expense_items_attributes][${index}][description]" class="form-control item-description" required placeholder="e.g., Pizza">
        </div>
        <div class="mb-3">
          <label class="form-label">Item Amount</label>
          <input type="number" step="0.01" min="0" name="expense[expense_items_attributes][${index}][amount]" class="form-control item-amount" required placeholder="0.00">
        </div>
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0">
              <i class="bi bi-people me-1"></i>Participants
            </label>
            <button class="btn btn-sm btn-outline-primary add-participant-to-item" type="button" data-item-index="${index}">
              <i class="bi bi-plus-circle me-1"></i>Add Participant
            </button>
          </div>
          <div class="participants-list">
            <div class="participant-row mb-2 p-2 bg-light rounded">
              <div class="d-flex gap-2 align-items-center">
                <div class="flex-grow-1">
                  <select name="expense[expense_items_attributes][${index}][expense_item_shares_attributes][0][user_id]" class="form-select user-select" required>
                    <option value="">Select user</option>
                    ${allUsers}
                  </select>
                </div>
                <div class="flex-grow-1">
                  <input type="number" step="0.01" min="0" name="expense[expense_items_attributes][${index}][expense_item_shares_attributes][0][amount]" class="form-control share-amount" placeholder="Amount" required>
                </div>
                <button class="btn btn-sm btn-outline-danger remove-participant" type="button">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function createParticipantHTML(itemIndex, participantIndex) {
    const allUsers = getAllUsersHTML();
    
    return `
      <div class="participant-row mb-2 p-2 bg-light rounded">
        <div class="d-flex gap-2 align-items-center">
          <div class="flex-grow-1">
            <select name="expense[expense_items_attributes][${itemIndex}][expense_item_shares_attributes][${participantIndex}][user_id]" class="form-select user-select" required>
              <option value="">Select user</option>
              ${allUsers}
            </select>
          </div>
          <div class="flex-grow-1">
            <input type="number" step="0.01" min="0" name="expense[expense_items_attributes][${itemIndex}][expense_item_shares_attributes][${participantIndex}][amount]" class="form-control share-amount" placeholder="Amount" required>
          </div>
          <button class="btn btn-sm btn-outline-danger remove-participant" type="button">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    `;
  }

  function renumberItems() {
    const items = document.querySelectorAll('.expense-item-card');
    items.forEach((item, index) => {
      const title = item.querySelector('h6');
      if (title) {
        title.innerHTML = `<i class="bi bi-receipt me-2"></i>Item ${index + 1}`;
      }
      // Update all input names in this item
      const itemIndex = index;
      item.setAttribute('data-item-index', itemIndex);
      
      // Update all form fields in this item
      item.querySelectorAll('input, select').forEach(field => {
        const name = field.getAttribute('name');
        if (name) {
          field.setAttribute('name', name.replace(/expense_items_attributes\]\[\d+\]/, `expense_items_attributes][${itemIndex}]`));
        }
      });
      
      // Update add participant button
      const addBtn = item.querySelector('.add-participant-to-item');
      if (addBtn) {
        addBtn.setAttribute('data-item-index', itemIndex);
      }
    });
    itemIndex = items.length;
  }

  function renumberParticipantsInItem(itemCard) {
    const itemIndex = itemCard.getAttribute('data-item-index');
    const participants = itemCard.querySelectorAll('.participant-row');
    participants.forEach((participant, index) => {
      participant.querySelectorAll('input, select').forEach(field => {
        const name = field.getAttribute('name');
        if (name) {
          field.setAttribute('name', name.replace(/expense_item_shares_attributes\]\[\d+\]/, `expense_item_shares_attributes][${index}]`));
        }
      });
    });
  }

  function attachItemListeners() {
    // Additional listeners can be attached here if needed
  }
});
