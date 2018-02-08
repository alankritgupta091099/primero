module AdvancedSearchHelper

  AND_OR = %Q{<input id="criteria_join_and" type="radio" value="AND" #AND_CHECKED name="criteria_list[#INDEX][join]">
<label for="criteria_join_and">And</label>
<input id="criteria_join_or" type="radio" value="OR" #OR_CHECKED name="criteria_list[#INDEX][join]">
<label for="criteria_join_or">Or</label>}
  DISPLAY_LABEL = %Q{<a class="select-criteria">#DISPLAY_NAME</a>}
  FIELD_INDEX = %Q{<input class="criteria-field" type="hidden" value="#FIELD" name="criteria_list[#INDEX][field]">
<input class="criteria-index" type="hidden" value="#INDEX" name="criteria_list[#INDEX][index]">}
  REMOVE_LINK = "<a class=\"remove-criteria\">remove</a>"

  def empty_lines(fields)
    if (@forms.size > fields.size )
      @forms.size - fields.size
    else
      0
    end
  end

  def generate_html(criteria, all_fields)
    return "" if criteria.field_display_name.blank?
    field = all_fields.find{|field| field.name == criteria.field}
    html = criteria.index.to_i > 0 ? AND_OR.gsub("#AND_CHECKED", criteria.join == "AND" ?  "checked=''" : "").gsub("#OR_CHECKED", criteria.join == "OR" ?  "checked=''" : "") : ""
    html += DISPLAY_LABEL.gsub("#DISPLAY_NAME", criteria.field_display_name)
    html += FIELD_INDEX.gsub("#FIELD", criteria.field)
    html += send("#{field.type}_criteria", criteria, field)
    html += REMOVE_LINK
    "<p class='criterion-selected'>#{html.gsub("#INDEX", criteria.index)}</p>"
  end
end
