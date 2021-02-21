/*
Beginner: 9x9, 10 mines
Intermediate: 16x16, 40 mines
Expert: 16x30, 99 mines
Custom: ?x? (allowed range in winmine.exe was 9 to 24 height and 9 to 30 width. mines had to be at least 10 and had to be some small percent less than height*width)
*/

var winmine = {};
winmine.height = 9;
winmine.width = 9;
winmine.mine_count = 10;
winmine.mouse_is_down = false;

winmine.get_array_of_neighbor_cells = function(cell_id_string) {
	const triggered_cell = cell_id_string.split('_');
	const triggered_cell_row = parseInt(triggered_cell[0], 10);
	const triggered_cell_col = parseInt(triggered_cell[1], 10);
	const top_left			= [triggered_cell_row - 1, triggered_cell_col - 1];
	const top_middle		= [triggered_cell_row - 1, triggered_cell_col];
	const top_right			= [triggered_cell_row - 1, triggered_cell_col + 1];
	const middle_left		= [triggered_cell_row, triggered_cell_col - 1];
	/* middle_self			= [triggered_cell_row, triggered_cell_col]; */
	const middle_right	= [triggered_cell_row, triggered_cell_col + 1];
	const bottom_left		= [triggered_cell_row + 1, triggered_cell_col - 1];
	const bottom_middle	= [triggered_cell_row + 1, triggered_cell_col];
	const bottom_right	= [triggered_cell_row + 1, triggered_cell_col + 1];
	const neighbor_cell_array = [top_left, top_middle, top_right, middle_left, middle_right, bottom_left, bottom_middle, bottom_right];
	const return_array = [];
	for (let i = 0; i < neighbor_cell_array.length; i += 1) {
		const cell_positions = neighbor_cell_array[i];
		const cell_string = cell_positions.join('_');
		const cell_position_row = cell_positions[0];
		const cell_position_col = cell_positions[1];
		if(cell_position_row >= 0
			&& cell_position_row < winmine.height
			&& cell_position_col >= 0
			&& cell_position_col < winmine.width
			&& !winmine.triggered_cells.includes(cell_string)) /* is still an untriggered cell worth searching */ {
			return_array.push(cell_string);
		}
	}
	return(return_array);
}

winmine.get_array_of_neighboring_mines = function(array_of_neighbor_cells) {
	const neighbor_mines = [];
	for (let i = 0; i < array_of_neighbor_cells.length; i += 1) {
		if(winmine.mines.includes(array_of_neighbor_cells[i])) {
			neighbor_mines.push(array_of_neighbor_cells[i]);
		}
	}
	return(neighbor_mines);
}

winmine.fill_cell_container = function(height, width) {

	const number_of_cells = height * width;

	// the global cells index, an array of row column ids (row_col)
	winmine.cells = [];
	for (let row = 0; row < height; row += 1) {
		for (let col = 0; col < width; col += 1) {
			winmine.cells.push([row, col].join("_"));
		}
	}
	winmine.triggered_cells = []; // where triggered cells go

	const cell_container = document.querySelector('.cell-container');
	for (let i = 0; i < winmine.cells.length; i += 1) {
		const cell_div = document.createElement('div');
		cell_div.id = 'cell_'.concat(winmine.cells[i]);
		cell_container.append(cell_div);
	}

	// create mines array with values used in cells array
	// create numeric vector beginning with 0 equal to count of cells in grid, then sort with Math.random() and trim to length of specified mines
	const random_numbers = Array.from(new Array(number_of_cells),(val,index)=>index).sort(function () { return Math.random() - 0.5;}).slice(0, winmine.mine_count);
	winmine.mines = [];
	for (let i = 0; i < random_numbers.length; i += 1) {
		winmine.mines.push(winmine.cells[random_numbers[i]]);
	}
	//winmine.mines = ["6_1", "3_1", "1_4", "2_7", "0_7", "1_2", "6_7", "4_5", "0_3", "0_8"];
	//winmine.mines = ["4_5", "4_6", "6_8", "5_5", "8_8"];

	// set css grid row column parameters
	const grid_template_rows = 'auto '.repeat(height);
	const grid_template_columns = 'auto '.repeat(width);
	cell_container.style.setProperty('grid-template-rows', grid_template_rows);
	cell_container.style.setProperty('grid-template-columns', grid_template_columns);
}

winmine.choose_cell = function(cell_html_id) {
	const cell_id_string = cell_html_id.substring(5);
	const cell_element = document.getElementById(cell_html_id);
	// 1. if cell is a mine, bye
	if(winmine.mines.includes(cell_id_string)) {
		//cell_element.classList.add('triggered-mine-cell'); // apply this to selected cell element
		cell_element.classList.add('mine-cell'); // apply this to every mine cell in winmine.mines
		cell_element.classList.add('triggered-cell');
		return;
	}
	// 2. if cell is not a mine, here we go
	const neighboring_cells = winmine.get_array_of_neighbor_cells(cell_id_string);
	const neighboring_mines = winmine.get_array_of_neighboring_mines(neighboring_cells);
	if(neighboring_mines.length > 0) {
		cell_element.style.setProperty('background-image', 'url(svg/'.concat(neighboring_mines.length,'.svg)'));
		cell_element.classList.add('triggered-cell');
		winmine.triggered_cells.push(cell_id_string);
		return;
	}
	if(neighboring_mines.length == 0) {
		winmine.triggered_cells.push(cell_id_string);
		cell_element.classList.add('triggered-cell');
		let search_elements_array = neighboring_cells;
		//winmine.triggered_cells.push(...search_elements_array);
		for (let i = 0; i < search_elements_array.length; i += 1) {
			const cell_id_string2 = search_elements_array[i];
			const cell_element2 = document.getElementById('cell_'.concat(cell_id_string2));
			const neighboring_cells2 = winmine.get_array_of_neighbor_cells(cell_id_string2);
			const neighboring_mines2 = winmine.get_array_of_neighboring_mines(neighboring_cells2);
			if(neighboring_mines2.length > 0) {
				cell_element2.style.setProperty('background-image', 'url(svg/'.concat(neighboring_mines2.length,'.svg)'));
				cell_element2.classList.add('triggered-cell');
			} else {
				cell_element2.classList.add('triggered-cell');
				for (let i = 0; i < neighboring_cells2.length; i += 1) {
					if(search_elements_array.indexOf(neighboring_cells2[i]) === -1) {
						search_elements_array.push(neighboring_cells2[i])
					}
				}
			}
			if(search_elements_array.length > 800) {
				alert("too many cells");
			}
		}
	}
}

document.addEventListener("DOMContentLoaded", function() { // make sure this can only fire once!
	winmine.fill_cell_container(winmine.height, winmine.width);
	const wm_cells = document.querySelectorAll('.cell-container > div');
	for (let i = 0; i < wm_cells.length; i += 1) {
		const wm_cell = wm_cells[i];
		wm_cell.addEventListener('mousedown', e => {
			winmine.mouse_is_down = true;
			if(!wm_cell.classList.contains('triggered-cell')) { // this check should be added to the events below too
				wm_cell.classList.add('active-cell');
			}
		});
		wm_cell.addEventListener('mouseup', e => {
			winmine.mouse_is_down = false;
			wm_cell.classList.remove('active-cell');
			winmine.choose_cell(wm_cell.id);
		});
		wm_cell.addEventListener('mouseover', e => {
			if(winmine.mouse_is_down == true) {
				wm_cell.classList.add('active-cell');
			}
		});
		wm_cell.addEventListener('mouseout', e => {
			wm_cell.classList.remove('active-cell');
		});
 	}

	// prevent broswer from displaying the "not allowable" cursor (used when click dragging cursor because elements are moveable in html)
	document.body.addEventListener('mousedown', e => {
		e.preventDefault();
	});
	// winmine.exe would remember your mouse button was down even if you left the window, as long as it stayed in focus. not sure this is possible in browser
	document.body.addEventListener('mouseleave', e => {
		winmine.mouse_is_down = false;
	});	
});