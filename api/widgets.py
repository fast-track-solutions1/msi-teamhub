from django import forms
from django.forms.widgets import SelectMultiple
from django.utils.safestring import mark_safe


class DualListWidget(SelectMultiple):
    """Widget avec deux listes - double-clic avec support thème sombre et clair"""
    
    def render(self, name, value, attrs, renderer=None):
        value = value or []
        
        # Générer les options
        available_html = ''
        selected_html = ''
        
        for option_value, option_label in self.choices:
            if str(option_value) not in [str(v) for v in value]:
                available_html += f'<li data-value="{option_value}" ondblclick="moveItem(this, \'{name}\');" class="dual-item" style="padding:8px; cursor:pointer; border-bottom:1px solid #ccc; transition:0.2s; color:#000;">{option_label}</li>'
            else:
                selected_html += f'<li data-value="{option_value}" ondblclick="moveItem(this, \'{name}\');" class="dual-item" style="padding:8px; cursor:pointer; border-bottom:1px solid #ccc; background:#c8e6c9; transition:0.2s; color:#000;">{option_label}</li>'
        
        # HTML du widget
        html = f'''
        <style>
            .dual-list-container {{
                display: flex;
                gap: 20px;
                padding: 15px;
                background: #fff;
                border: 1px solid #ccc;
                border-radius: 4px;
                min-height: 300px;
            }}
            
            .dual-list-col {{
                flex: 1;
                display: flex;
                flex-direction: column;
            }}
            
            .dual-list-header {{
                font-weight: 600;
                font-size: 12px;
                color: #333;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 2px solid #2196f3;
                text-transform: uppercase;
            }}
            
            .dual-list {{
                list-style: none;
                padding: 0;
                margin: 0;
                border: 1px solid #999;
                background: #fff;
                border-radius: 3px;
                overflow-y: auto;
                max-height: 300px;
                flex: 1;
            }}
            
            .dual-item {{
                color: #000 !important;
                background: #fff !important;
            }}
            
            .dual-item:hover {{
                background: #e3f2fd !important;
                color: #1976d2 !important;
            }}
            
            .dual-item.selected {{
                background: #4caf50 !important;
                color: #fff !important;
            }}
        </style>
        
        <div class="dual-list-container">
            
            <!-- GAUCHE - DISPONIBLES -->
            <div class="dual-list-col">
                <div class="dual-list-header">
                    Disponibles
                </div>
                <ul id="{name}_available" class="dual-list">
                    {available_html}
                </ul>
            </div>
            
            <!-- DROITE - SÉLECTIONNÉS -->
            <div class="dual-list-col">
                <div class="dual-list-header" style="border-bottom-color: #4caf50;">
                    Sélectionnés
                </div>
                <ul id="{name}_selected" class="dual-list">
                    {selected_html}
                </ul>
            </div>
        </div>
        
        <!-- SELECT CACHÉ -->
        <select id="{name}" name="{name}" multiple style="display:none;">
        '''
        
        for option_value, option_label in self.choices:
            selected = 'selected' if str(option_value) in [str(v) for v in value] else ''
            html += f'<option value="{option_value}" {selected}>{option_label}</option>'
        
        html += '''
        </select>
        
        <script>
        function moveItem(element, fieldName) {{
            const value = element.dataset.value;
            const text = element.textContent;
            const fromList = element.parentElement;
            const toList = fromList.id.includes('available') 
                ? document.getElementById(fieldName + '_selected')
                : document.getElementById(fieldName + '_available');
            
            const newItem = document.createElement('li');
            newItem.textContent = text;
            newItem.dataset.value = value;
            newItem.className = 'dual-item';
            newItem.ondblclick = function() {{ moveItem(this, fieldName); }};
            newItem.style.cssText = 'padding:8px; cursor:pointer; border-bottom:1px solid #ccc; transition:0.2s; color:#000;';
            
            if (toList.id.includes('selected')) {{
                newItem.style.backgroundColor = '#c8e6c9';
            }} else {{
                newItem.style.backgroundColor = '#fff';
            }}
            
            element.remove();
            toList.appendChild(newItem);
            updateSelect(fieldName);
        }}
        
        function updateSelect(fieldName) {{
            const selected = document.getElementById(fieldName + '_selected');
            const select = document.getElementById(fieldName);
            const items = selected.querySelectorAll('li');
            
            select.querySelectorAll('option').forEach(opt => opt.selected = false);
            
            items.forEach(item => {{
                const itemValue = item.dataset.value;
                Array.from(select.options).forEach(opt => {{
                    if (opt.value === itemValue) {{
                        opt.selected = true;
                    }}
                }});
            }});
        }}
        </script>
        '''
        
        return mark_safe(html)
