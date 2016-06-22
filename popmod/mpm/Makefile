
default: select_year.js select_years.js select_stages.js select_fecundity.js \
	select_fecundity_matrix.js set_abundance.js show_results.js \
	select_matrices.js

select_year.js: select_year.coffee
	coffee --join select_year.js --compile select_year.coffee

select_years.js: select_years.coffee
	coffee --join select_years.js --compile select_years.coffee

select_stages.js: select_stages.coffee
	coffee --join select_stages.js --compile select_stages.coffee

select_fecundity.js: select_fecundity.coffee
	coffee --join select_fecundity.js --compile select_fecundity.coffee

select_fecundity_matrix.js: select_fecundity_matrix.coffee
	coffee --join select_fecundity_matrix.js --compile select_fecundity_matrix.coffee

set_abundance.js: set_abundance.coffee
	coffee --join set_abundance.js --compile set_abundance.coffee

show_results.js: show_results.coffee
	coffee --join show_results.js --compile show_results.coffee

select_matrices.js: select_matrices.coffee
	coffee --join select_matrices.js --compile select_matrices.coffee
