package cn.coderhythm.models;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.Date;

@Entity
@Table(name = "maintenance_units")
public class MaintenanceUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String unitName;

    @Size(max = 50)
    private String maintenanceLevel;

    @Size(max = 200)
    private String treeTypes;

    @NotNull
    private Integer treeCount;

    @NotNull
    private Double greenArea;

    @NotNull
    private Integer patchCount;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    // 默认构造函数
    public MaintenanceUnit() {
    }

    // 带参数的构造函数
    public MaintenanceUnit(String unitName, String maintenanceLevel, String treeTypes,
                           Integer treeCount, Double greenArea, Integer patchCount) {
        this.unitName = unitName;
        this.maintenanceLevel = maintenanceLevel;
        this.treeTypes = treeTypes;
        this.treeCount = treeCount;
        this.greenArea = greenArea;
        this.patchCount = patchCount;
    }

    // 在保存前自动设置创建时间和更新时间
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    // 在更新前自动设置更新时间
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
} 