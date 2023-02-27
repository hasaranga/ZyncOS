import * as ImGui from "../imgui/imgui.js";

export function isMobile() {
    if ('maxTouchPoints' in navigator) return navigator.maxTouchPoints > 0;

    const mQ = matchMedia?.('(pointer:coarse)');
    if (mQ?.media === '(pointer:coarse)') return !!mQ.matches;
    
    if ('orientation' in window) return true;
    
    return false;
}

export function SetupZyncTheme()
{
	// Enemymouse style by enemymouse from ImThemes
	let style = ImGui.GetStyle();
	
	style.Alpha = 1.0;
	style.DisabledAlpha = 0.6000000238418579;
	//style.WindowPadding = ImVec2(8.0f, 8.0f);
	style.WindowRounding = 3.0;
	style.WindowBorderSize = 1.0;
	//style.WindowMinSize = ImVec2(32.0f, 32.0f);
	//style.WindowTitleAlign = ImVec2(0.0f, 0.5f);
	//style.WindowMenuButtonPosition = ImGuiDir_Left;
	style.ChildRounding = 3.0;
	style.ChildBorderSize = 1.0;
	style.PopupRounding = 0.0;
	style.PopupBorderSize = 1.0;
	//style.FramePadding = ImVec2(4.0f, 3.0f);
	style.FrameRounding = 3.0;
	style.FrameBorderSize = 0.0;
	//style.ItemSpacing = ImVec2(8.0f, 4.0f);
	//style.ItemInnerSpacing = ImVec2(4.0f, 4.0f);
	//style.CellPadding = ImVec2(4.0f, 2.0f);
	style.IndentSpacing = 21.0;
	style.ColumnsMinSpacing = 6.0;
	style.ScrollbarSize = isMobile() ? 30.0 : 18.0;
	style.ScrollbarRounding = 9.0;
	style.GrabMinSize = 20.0;
	style.GrabRounding = 1.0;
	style.TabRounding = 4.0;
	style.TabBorderSize = 0.0;
	style.TabMinWidthForCloseButton = 0.0;
	//style.ColorButtonPosition = ImGuiDir_Right;
	//style.ButtonTextAlign = ImVec2(0.5f, 0.5f);
	//style.SelectableTextAlign = ImVec2(0.0f, 0.0f);
	
	style.Colors[ImGui.ImGuiCol.Text] = new ImGui.Vec4(0.0, 1.0, 1.0, 1.0);
	style.Colors[ImGui.ImGuiCol.TextDisabled] = new ImGui.Vec4(0.2, 0.2000000059604645, 0.207843142747879, 1.0);
	style.Colors[ImGui.ImGuiCol.WindowBg] = new ImGui.Vec4(0.0, 0.0, 0.0, 1.0);
	style.Colors[ImGui.ImGuiCol.ChildBg] = new ImGui.Vec4(0.0, 0.0, 0.0, 0.0);
	style.Colors[ImGui.ImGuiCol.PopupBg] = new ImGui.Vec4(0.1568627506494522, 0.239215686917305, 0.2196078449487686, 1.0);
	style.Colors[ImGui.ImGuiCol.Border] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.6499999761581421);
	style.Colors[ImGui.ImGuiCol.BorderShadow] = new ImGui.Vec4(0.0, 0.0, 0.0, 0.0);
	style.Colors[ImGui.ImGuiCol.FrameBg] = new ImGui.Vec4(0.4392156898975372, 0.800000011920929, 0.800000011920929, 0.1800000071525574);
	style.Colors[ImGui.ImGuiCol.FrameBgHovered] = new ImGui.Vec4(0.4392156898975372, 0.800000011920929, 0.800000011920929, 0.2700000107288361);
	style.Colors[ImGui.ImGuiCol.FrameBgActive] = new ImGui.Vec4(0.4392156898975372, 0.8078431487083435, 0.8588235378265381, 0.6600000262260437);
	style.Colors[ImGui.ImGuiCol.TitleBg] = new ImGui.Vec4(0.078, 0.403, 0.403, 1.0);
	style.Colors[ImGui.ImGuiCol.TitleBgActive] = new ImGui.Vec4(0.068, 0.586, 0.586, 1.0);
	style.Colors[ImGui.ImGuiCol.TitleBgCollapsed] = new ImGui.Vec4(0.0, 0.0, 0.0, 0.5400000214576721);
	style.Colors[ImGui.ImGuiCol.MenuBarBg] = new ImGui.Vec4(0.0, 0.0, 0.0, 0.2000000029802322);
	style.Colors[ImGui.ImGuiCol.ScrollbarBg] = new ImGui.Vec4(0.2196078449487686, 0.2862745225429535, 0.2980392277240753, 0.7099999785423279);
	style.Colors[ImGui.ImGuiCol.ScrollbarGrab] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.4399999976158142);
	style.Colors[ImGui.ImGuiCol.ScrollbarGrabHovered] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.7400000095367432);
	style.Colors[ImGui.ImGuiCol.ScrollbarGrabActive] = new ImGui.Vec4(0.0, 1.0, 1.0, 1.0);
	style.Colors[ImGui.ImGuiCol.CheckMark] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.6800000071525574);
	style.Colors[ImGui.ImGuiCol.SliderGrab] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.3600000143051147);
	style.Colors[ImGui.ImGuiCol.SliderGrabActive] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.7599999904632568);
	style.Colors[ImGui.ImGuiCol.Button] = new ImGui.Vec4(0.0, 0.6470588445663452, 0.6470588445663452, 0.4600000083446503);
	style.Colors[ImGui.ImGuiCol.ButtonHovered] = new ImGui.Vec4(0.007843137718737125, 1.0, 1.0, 0.4300000071525574);
	style.Colors[ImGui.ImGuiCol.ButtonActive] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.6200000047683716);
	style.Colors[ImGui.ImGuiCol.Header] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.3300000131130219);
	style.Colors[ImGui.ImGuiCol.HeaderHovered] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.4199999868869781);
	style.Colors[ImGui.ImGuiCol.HeaderActive] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.5400000214576721);
	style.Colors[ImGui.ImGuiCol.Separator] = new ImGui.Vec4(0.0, 0.4980392158031464, 0.4980392158031464, 0.3300000131130219);
	style.Colors[ImGui.ImGuiCol.SeparatorHovered] = new ImGui.Vec4(0.0, 0.4980392158031464, 0.4980392158031464, 0.4699999988079071);
	style.Colors[ImGui.ImGuiCol.SeparatorActive] = new ImGui.Vec4(0.0, 0.6980392336845398, 0.6980392336845398, 1.0);
	style.Colors[ImGui.ImGuiCol.ResizeGrip] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.5400000214576721);
	style.Colors[ImGui.ImGuiCol.ResizeGripHovered] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.7400000095367432);
	style.Colors[ImGui.ImGuiCol.ResizeGripActive] = new ImGui.Vec4(0.0, 1.0, 1.0, 1.0);
	style.Colors[ImGui.ImGuiCol.Tab] = new ImGui.Vec4(0.1764705926179886, 0.3490196168422699, 0.5764706134796143, 0.8619999885559082);
	style.Colors[ImGui.ImGuiCol.TabHovered] = new ImGui.Vec4(0.2588235437870026, 0.5882353186607361, 0.9764705896377563, 0.800000011920929);
	style.Colors[ImGui.ImGuiCol.TabActive] = new ImGui.Vec4(0.196078434586525, 0.407843142747879, 0.6784313917160034, 1.0);
	style.Colors[ImGui.ImGuiCol.TabUnfocused] = new ImGui.Vec4(0.06666667014360428, 0.1019607856869698, 0.1450980454683304, 0.9724000096321106);
	style.Colors[ImGui.ImGuiCol.TabUnfocusedActive] = new ImGui.Vec4(0.1333333402872086, 0.2588235437870026, 0.4235294163227081, 1.0);
	style.Colors[ImGui.ImGuiCol.PlotLines] = new ImGui.Vec4(0.0, 1.0, 1.0, 1.0);
	style.Colors[ImGui.ImGuiCol.PlotLinesHovered] = new ImGui.Vec4(0.0, 1.0, 1.0, 1.0);
	style.Colors[ImGui.ImGuiCol.PlotHistogram] = new ImGui.Vec4(0.0, 1.0, 1.0, 1.0);
	style.Colors[ImGui.ImGuiCol.PlotHistogramHovered] = new ImGui.Vec4(0.0, 1.0, 1.0, 1.0);
	style.Colors[ImGui.ImGuiCol.TableHeaderBg] = new ImGui.Vec4(0.1882352977991104, 0.1882352977991104, 0.2000000029802322, 1.0);
	style.Colors[ImGui.ImGuiCol.TableBorderStrong] = new ImGui.Vec4(0.3098039329051971, 0.3098039329051971, 0.3490196168422699, 1.0);
	style.Colors[ImGui.ImGuiCol.TableBorderLight] = new ImGui.Vec4(0.2274509817361832, 0.2274509817361832, 0.2470588237047195, 1.0);
	style.Colors[ImGui.ImGuiCol.TableRowBg] = new ImGui.Vec4(0.0, 0.0, 0.0, 0.0);
	style.Colors[ImGui.ImGuiCol.TableRowBgAlt] = new ImGui.Vec4(1.0, 1.0, 1.0, 0.05999999865889549);
	style.Colors[ImGui.ImGuiCol.TextSelectedBg] = new ImGui.Vec4(0.0, 1.0, 1.0, 0.2199999988079071);
	style.Colors[ImGui.ImGuiCol.DragDropTarget] = new ImGui.Vec4(1.0, 1.0, 0.0, 0.8999999761581421);
	style.Colors[ImGui.ImGuiCol.NavHighlight] = new ImGui.Vec4(0.2588235437870026, 0.5882353186607361, 0.9764705896377563, 1.0);
	style.Colors[ImGui.ImGuiCol.NavWindowingHighlight] = new ImGui.Vec4(1.0, 1.0, 1.0, 0.699999988079071);
	style.Colors[ImGui.ImGuiCol.NavWindowingDimBg] = new ImGui.Vec4(0.800000011920929, 0.800000011920929, 0.800000011920929, 0.2000000029802322);
	style.Colors[ImGui.ImGuiCol.ModalWindowDimBg] = new ImGui.Vec4(0.03921568766236305, 0.09803921729326248, 0.08627451211214066, 0.5099999904632568);
}