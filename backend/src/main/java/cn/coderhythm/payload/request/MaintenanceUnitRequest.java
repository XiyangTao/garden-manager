package cn.coderhythm.payload.request;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class MaintenanceUnitRequest {

    @NotBlank(message = "管养单元名称不能为空")
    @Size(max = 100, message = "管养单元名称长度不能超过100个字符")
    private String unitName;

    @Size(max = 50, message = "养护等级长度不能超过50个字符")
    private String maintenanceLevel;

    @Size(max = 200, message = "树种类型长度不能超过200个字符")
    private String treeTypes;

    @NotNull(message = "树木数量不能为空")
    private Integer treeCount;

    @NotNull(message = "绿地面积不能为空")
    private Double greenArea;

    @NotNull(message = "斑块数量不能为空")
    private Integer patchCount;

    // 构造函数
    public MaintenanceUnitRequest() {}

    public MaintenanceUnitRequest(String unitName, String maintenanceLevel, String treeTypes,
                               Integer treeCount, Double greenArea, Integer patchCount) {
        this.unitName = unitName;
        this.maintenanceLevel = maintenanceLevel;
        this.treeTypes = treeTypes;
        this.treeCount = treeCount;
        this.greenArea = greenArea;
        this.patchCount = patchCount;
    }

    // Getters and Setters
    public String getUnitName() {
        return unitName;
    }

    public void setUnitName(String unitName) {
        this.unitName = unitName;
    }

    public String getMaintenanceLevel() {
        return maintenanceLevel;
    }

    public void setMaintenanceLevel(String maintenanceLevel) {
        this.maintenanceLevel = maintenanceLevel;
    }

    public String getTreeTypes() {
        return treeTypes;
    }

    public void setTreeTypes(String treeTypes) {
        this.treeTypes = treeTypes;
    }

    public Integer getTreeCount() {
        return treeCount;
    }

    public void setTreeCount(Integer treeCount) {
        this.treeCount = treeCount;
    }

    public Double getGreenArea() {
        return greenArea;
    }

    public void setGreenArea(Double greenArea) {
        this.greenArea = greenArea;
    }

    public Integer getPatchCount() {
        return patchCount;
    }

    public void setPatchCount(Integer patchCount) {
        this.patchCount = patchCount;
    }
} 